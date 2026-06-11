import { Link, createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, FileText, Loader2, Plus, Save, Star, Trash2, Users } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, type ClientProjectInput, type ClientProjectPayload, type PriceSuggestionPayload, type RecommendedFreelancerItem } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/client/projects")({
  head: () => ({ meta: [{ title: "Mis proyectos - SkilltoMoney" }] }),
  component: ClientProjectsPage,
});

const EMPTY_FORM: ClientProjectInput = {
  title: "",
  category: "",
  description: "",
  budget_min: "",
  budget_max: "",
  expected_delivery_days: null,
  status: "published",
  progress: 0,
  ai_generated: false,
};

const STATUS_LABELS: Record<ClientProjectPayload["status"], string> = {
  draft: "Borrador",
  published: "Publicado",
  in_progress: "En progreso",
  completed: "Completado",
  cancelled: "Cancelado",
};

function ClientProjectsPage() {
  const token = getToken();
  const user = getSessionUser();
  const isMype = user?.account_type === "mype";
  const [projects, setProjects] = useState<ClientProjectPayload[]>([]);
  const [canCreate, setCanCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ClientProjectInput>(EMPTY_FORM);
  const [insightProjectId, setInsightProjectId] = useState<number | null>(null);
  const [projectPriceSuggestion, setProjectPriceSuggestion] = useState<PriceSuggestionPayload | null>(null);
  const [projectRecommendations, setProjectRecommendations] = useState<RecommendedFreelancerItem[]>([]);
  const [draftPriceSuggestion, setDraftPriceSuggestion] = useState<PriceSuggestionPayload | null>(null);

  const loadProjects = useCallback(async () => {
    if (!token || !isMype) {
      setProjects([]);
      setCanCreate(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.getClientProjects(token);
      const loadedProjects = response.data?.projects ?? [];
      setProjects(loadedProjects);
      setCanCreate(Boolean(response.data?.limits.can_create));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudieron cargar tus proyectos."));
      setProjects([]);
      setCanCreate(false);
    } finally {
      setLoading(false);
    }
  }, [isMype, token]);

  const loadProjectInsights = useCallback(async (projectId: number) => {
    if (!token) return;

    setInsightProjectId(projectId);

    const [priceResponse, recommendationsResponse] = await Promise.all([
      api.getPriceSuggestion(token, { project_id: projectId }).catch(() => ({ data: null })),
      api.getFreelancerRecommendations(token, { project_id: projectId, limit: 3 }).catch(() => ({ data: { recommendations: [] } })),
    ]);

    setProjectPriceSuggestion(priceResponse.data ?? null);
    setProjectRecommendations(recommendationsResponse.data?.recommendations ?? []);
  }, [token]);

  useEffect(() => {
    if (projects[0] && insightProjectId === null) {
      void loadProjectInsights(projects[0].id);
    }

    if (projects.length === 0) {
      setInsightProjectId(null);
      setProjectPriceSuggestion(null);
      setProjectRecommendations([]);
    }
  }, [insightProjectId, loadProjectInsights, projects]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const activeProjects = useMemo(
    () => projects.filter((project) => project.status !== "cancelled" && project.status !== "completed").length,
    [projects],
  );

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const startCreate = () => {
    setMessage(null);
    setError(null);
    setDraftPriceSuggestion(null);

    if (!canCreate) {
      setError("Tu plan Free permite crear 1 proyecto. Actualiza a Pro para publicar mas proyectos.");
      return;
    }

    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (project: ClientProjectPayload) => {
    setMessage(null);
    setError(null);
    setDraftPriceSuggestion(null);
    setEditingId(project.id);
    setForm({
      title: project.title,
      category: project.category ?? "",
      description: project.description,
      budget_min: project.budget_min ?? "",
      budget_max: project.budget_max ?? "",
      expected_delivery_days: project.expected_delivery_days,
      status: project.status,
      progress: project.progress,
      ai_generated: project.ai_generated,
    });
    setShowForm(true);
  };

  const saveProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload: ClientProjectInput = {
        ...form,
        category: cleanOptional(form.category),
        budget_min: cleanOptional(form.budget_min),
        budget_max: cleanOptional(form.budget_max),
        expected_delivery_days: form.expected_delivery_days ? Number(form.expected_delivery_days) : null,
        progress: Number(form.progress ?? 0),
      };

      if (editingId) {
        await api.updateClientProject(token, editingId, payload);
        setMessage("Proyecto actualizado correctamente.");
      } else {
        await api.createClientProject(token, payload);
        setMessage("Proyecto creado correctamente.");
      }

      resetForm();
      await loadProjects();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo guardar el proyecto."));
    } finally {
      setSaving(false);
    }
  };

  const calculateDraftPrice = async () => {
    if (!token) return;

    setError(null);
    setDraftPriceSuggestion(null);

    try {
      const response = await api.getPriceSuggestion(token, {
        category: form.category ?? "",
        search: `${form.title} ${form.description}`.trim(),
      });
      setDraftPriceSuggestion(response.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo calcular el rango sugerido."));
    }
  };

  const deleteProject = async (project: ClientProjectPayload) => {
    if (!token || !window.confirm(`Eliminar "${project.title}"?`)) return;

    setError(null);
    setMessage(null);

    try {
      await api.deleteClientProject(token, project.id);
      setMessage("Proyecto eliminado correctamente.");
      await loadProjects();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo eliminar el proyecto."));
    }
  };

  if (!isMype) {
    return (
      <DashboardShell role="client">
        <EmptyState title="Vista disponible solo para MYPES" detail="Inicia sesion como MYPE para gestionar proyectos." />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="client">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Mis proyectos</h1>
            <p className="text-muted-foreground">Crea publicaciones reales para encontrar freelancers segun tus necesidades.</p>
          </div>
          <Button onClick={startCreate} className="rounded-xl bg-gradient-primary shadow-soft">
            <Plus className="h-4 w-4" />
            Crear proyecto
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="Plan actual" value="Free" hint="1 proyecto disponible" />
          <Metric label="Proyectos creados" value={String(projects.length)} hint={`${activeProjects} activos`} />
          <Metric label="Limite Free" value="1" hint={canCreate ? "Disponible" : "Limite alcanzado"} />
        </div>

        {!canCreate && !editingId ? (
          <Card className="rounded-2xl border-secondary/30 bg-secondary/10 p-5">
            <div className="font-display text-lg font-bold">Limite del plan Free alcanzado</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Puedes editar o eliminar tu proyecto actual. Para crear mas publicaciones, activa el plan Pro desde Premium.
            </p>
          </Card>
        ) : null}

        {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p> : null}
        {message ? <p className="rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-2 text-sm text-secondary">{message}</p> : null}

        {showForm ? (
          <Card className="rounded-2xl p-5 shadow-soft">
            <form onSubmit={saveProject} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Titulo del proyecto">
                  <Input value={form.title} onChange={(event) => setFormValue("title", event.target.value, setForm)} required maxLength={150} />
                </Field>
                <Field label="Categoria">
                  <Input value={form.category ?? ""} onChange={(event) => setFormValue("category", event.target.value, setForm)} placeholder="Ej. Marketing, Diseno, Web" />
                </Field>
              </div>

              <Field label="Descripcion">
                <Textarea
                  value={form.description}
                  onChange={(event) => setFormValue("description", event.target.value, setForm)}
                  placeholder="Describe que necesitas, objetivo, entregables y referencias."
                  required
                  rows={5}
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-4">
                <Field label="Presupuesto minimo">
                  <Input type="number" min={0} value={form.budget_min ?? ""} onChange={(event) => setFormValue("budget_min", event.target.value, setForm)} />
                </Field>
                <Field label="Presupuesto maximo">
                  <Input type="number" min={0} value={form.budget_max ?? ""} onChange={(event) => setFormValue("budget_max", event.target.value, setForm)} />
                </Field>
                <Field label="Entrega esperada">
                  <Input
                    type="number"
                    min={1}
                    value={form.expected_delivery_days ?? ""}
                    onChange={(event) => setFormValue("expected_delivery_days", event.target.value ? Number(event.target.value) : null, setForm)}
                    placeholder="Dias"
                  />
                </Field>
                <Field label="Progreso">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={form.progress ?? 0}
                    onChange={(event) => setFormValue("progress", Number(event.target.value), setForm)}
                  />
                </Field>
              </div>

              <Field label="Estado">
                <select
                  value={form.status}
                  onChange={(event) => setFormValue("status", event.target.value as ClientProjectPayload["status"], setForm)}
                  className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => void calculateDraftPrice()} disabled={saving}>
                  Calcular rango sugerido
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving} className="bg-gradient-primary shadow-soft">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editingId ? "Guardar cambios" : "Crear proyecto"}
                </Button>
              </div>

              {draftPriceSuggestion ? <PriceSuggestionBox suggestion={draftPriceSuggestion} /> : null}
            </form>
          </Card>
        ) : null}

        {loading ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            title="Aun no tienes proyectos"
            detail="Crea tu primera publicacion para que los freelancers puedan entender que necesitas."
          />
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <Card key={project.id} className="rounded-2xl p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-xl font-bold">{project.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{project.category || "Sin categoria"}</div>
                  </div>
                  <Badge variant="outline" className="border-secondary/40 text-secondary">
                    {STATUS_LABELS[project.status]}
                  </Badge>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{project.description}</p>
                <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                  <Info label="Presupuesto" value={formatBudget(project)} />
                  <Info label="Entrega" value={project.expected_delivery_days ? `${project.expected_delivery_days} dias` : "No definida"} />
                  <Info label="Origen" value={project.ai_generated ? "Creado con IA" : "Creado manualmente"} />
                </div>
                {insightProjectId === project.id ? (
                  <div className="mt-4 grid gap-3 lg:grid-cols-[0.8fr_1fr]">
                    <PriceSuggestionBox suggestion={projectPriceSuggestion} />
                    <Card className="rounded-xl border-secondary/20 bg-secondary/5 p-4 shadow-none">
                      <div className="mb-3 flex items-center gap-2 font-bold">
                        <Users className="h-4 w-4 text-secondary" />
                        Freelancers compatibles
                      </div>
                      {projectRecommendations.length > 0 ? (
                        <div className="space-y-2">
                          {projectRecommendations.map((freelancer) => (
                            <Link
                              key={freelancer.id}
                              to="/dashboard/client/freelancers/$freelancerId"
                              params={{ freelancerId: String(freelancer.id) }}
                              className="flex items-center justify-between gap-3 rounded-lg bg-background px-3 py-2 text-sm transition hover:bg-muted"
                            >
                              <div>
                                <div className="font-semibold">{freelancer.name}</div>
                                <div className="text-xs text-muted-foreground">{freelancer.headline ?? freelancer.category ?? "Freelancer"}</div>
                              </div>
                              <span className="flex items-center gap-1 text-xs font-semibold text-secondary">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                {Math.round(freelancer.score)}%
                              </span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Aun no hay freelancers compatibles con datos suficientes.</p>
                      )}
                    </Card>
                  </div>
                ) : null}
                <div className="mt-5">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Avance</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => void loadProjectInsights(project.id)}>
                    Ver match
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => startEdit(project)}>
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="text-primary" onClick={() => void deleteProject(project)}>
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="rounded-2xl p-5 shadow-soft">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-3xl font-extrabold">{value}</div>
      <div className="mt-1 text-xs font-semibold text-secondary">{hint}</div>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function PriceSuggestionBox({ suggestion }: { suggestion: PriceSuggestionPayload | null }) {
  return (
    <Card className="rounded-xl border-secondary/20 bg-secondary/5 p-4 shadow-none">
      <div className="font-bold">Rango sugerido por mercado</div>
      {suggestion?.has_data ? (
        <>
          <div className="mt-2 font-display text-2xl font-extrabold">
            S/ {suggestion.recommended_min?.toFixed(0)} - S/ {suggestion.recommended_max?.toFixed(0)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Promedio S/ {suggestion.average_price?.toFixed(0)} basado en {suggestion.sample_count} publicacion{suggestion.sample_count === 1 ? "" : "es"} real{suggestion.sample_count === 1 ? "" : "es"}.
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">Aun no hay datos suficientes para calcular un rango real.</p>
      )}
    </Card>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-soft">
      <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
      <h2 className="mt-4 font-display text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

function setFormValue<K extends keyof ClientProjectInput>(
  key: K,
  value: ClientProjectInput[K],
  setForm: React.Dispatch<React.SetStateAction<ClientProjectInput>>,
) {
  setForm((current) => ({ ...current, [key]: value }));
}

function cleanOptional(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getErrorMessage(err: unknown, fallback: string): string {
  const payload = err as { message?: string; errors?: Record<string, string[]> };
  const firstError = Object.values(payload?.errors ?? {})[0]?.[0];
  return firstError ?? payload?.message ?? fallback;
}

function formatBudget(project: ClientProjectPayload): string {
  if (project.budget_min && project.budget_max) return `S/ ${Number(project.budget_min).toFixed(0)} - S/ ${Number(project.budget_max).toFixed(0)}`;
  if (project.budget_min) return `Desde S/ ${Number(project.budget_min).toFixed(0)}`;
  if (project.budget_max) return `Hasta S/ ${Number(project.budget_max).toFixed(0)}`;
  return "No definido";
}
