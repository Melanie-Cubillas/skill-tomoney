import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Briefcase, Building2, CalendarDays, Eye, Loader2, Search } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, type ClientProjectDetailPayload } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/freelancer/projects")({
  head: () => ({ meta: [{ title: "Buscar proyectos MYPE - SkilltoMoney" }] }),
  component: FreelancerProjectSearchPage,
});

function FreelancerProjectSearchPage() {
  const navigate = useNavigate();
  const token = getToken();
  const user = useMemo(() => getSessionUser(), []);
  const [projects, setProjects] = useState<ClientProjectDetailPayload[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);

      api
        .getPublicClientProjects(token, {
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(category.trim() ? { category: category.trim() } : {}),
        })
        .then((response) => setProjects(response.data?.projects ?? []))
        .catch((err) => {
          const payload = err as { message?: string };
          setProjects([]);
          setError(payload?.message ?? "No se pudieron cargar los proyectos.");
        })
        .finally(() => setLoading(false));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [category, search, token]);

  if (user?.account_type !== "freelancer") {
    return (
      <DashboardShell role="freelancer">
        <EmptyState title="Vista disponible solo para freelancers" detail="Inicia sesión como freelancer para buscar proyectos MYPE." />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="freelancer">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-normal">Buscar proyectos MYPE</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Explora publicaciones reales de MYPES y abre el detalle para evaluar oportunidades.
          </p>
        </div>

        <Card className="rounded-2xl p-5 shadow-soft">
          <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre, descripción o habilidad..."
                className="h-11 rounded-xl pl-9"
              />
            </div>
            <Input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Categoría, ej. video, Excel..."
              className="h-11 rounded-xl"
            />
          </div>
        </Card>

        {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            title="Aún no hay proyectos disponibles"
            detail="Cuando una MYPE publique oportunidades, aparecerán aquí para que puedas revisarlas."
          />
        ) : (
          <div className="grid gap-5">
            {projects.map((project) => (
              <Card key={project.id} className="rounded-2xl p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Badge className="bg-[#00C9BA] text-white hover:bg-[#00C9BA]">
                      {project.category || "Proyecto digital"}
                    </Badge>
                    <h2 className="mt-3 font-display text-2xl font-bold">{project.title}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                      {project.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-extrabold">
                      {formatBudget(project.budget_min, project.budget_max)}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">Presupuesto referencial</div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {project.mype.name}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {project.expected_delivery_days ? `${project.expected_delivery_days} días` : "Sin fecha estimada"}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    {project.views_count ?? 0} vistas
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={() => void navigate({
                      to: "/dashboard/freelancer/projects/$projectId",
                      params: { projectId: String(project.id) },
                    })}
                    className="rounded-xl bg-gradient-primary"
                  >
                    <Briefcase className="h-4 w-4" />
                    Ver proyecto
                  </Button>
                  {project.mype.id ? (
                    <Button
                      type="button"
                      onClick={() => void navigate({
                        to: "/dashboard/freelancer/mypes/$mypeId",
                        params: { mypeId: String(project.mype.id) },
                      })}
                      variant="outline"
                      className="rounded-xl"
                    >
                      Ver MYPE
                    </Button>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <Card className="rounded-2xl border-dashed p-8 text-center shadow-soft">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{detail}</p>
    </Card>
  );
}

function formatBudget(min: string | number | null, max: string | number | null): string {
  const minValue = min !== null ? Number(min) : null;
  const maxValue = max !== null ? Number(max) : null;

  if (minValue !== null && maxValue !== null) return `S/ ${minValue.toFixed(0)} - S/ ${maxValue.toFixed(0)}`;
  if (minValue !== null) return `Desde S/ ${minValue.toFixed(0)}`;
  if (maxValue !== null) return `Hasta S/ ${maxValue.toFixed(0)}`;

  return "A negociar";
}
