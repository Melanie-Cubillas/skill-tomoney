import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Briefcase, CalendarDays, Loader2, MessageSquare } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { api, type ClientProjectDetailPayload } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/freelancer/projects/$projectId")({
  head: () => ({ meta: [{ title: "Detalle de proyecto MYPE - SkilltoMoney" }] }),
  component: FreelancerProjectDetailPage,
});

function FreelancerProjectDetailPage() {
  const navigate = useNavigate();
  const token = getToken();
  const user = getSessionUser();
  const isFreelancer = user?.account_type === "freelancer";
  const { projectId } = Route.useParams();
  const [project, setProject] = useState<ClientProjectDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !isFreelancer) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.getClientProjectItem(token, Number(projectId));
        setProject(response.data ?? null);
      } catch (err: unknown) {
        const payload = err as { message?: string };
        setError(payload?.message ?? "No se pudo cargar el proyecto.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [isFreelancer, projectId, token]);

  const contactMype = async () => {
    if (!token || !project?.mype.id || contacting) return;

    setContacting(true);
    setError(null);

    try {
      const response = await api.createConversation(token, {
        mype_profile_id: project.mype.id,
        message: `Hola, me interesa el proyecto "${project.title}". ¿Podemos revisar los detalles?`,
      });

      await navigate({
        to: "/dashboard/messages",
        search: { conversation: response.data?.conversation.id },
      });
    } catch (err: unknown) {
      const payload = err as { message?: string };
      setError(payload?.message ?? "No se pudo contactar a la MYPE.");
    } finally {
      setContacting(false);
    }
  };

  return (
    <DashboardShell role="freelancer">
      <div className="space-y-6">
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/dashboard/freelancer/projects">
            <ArrowLeft className="h-4 w-4" />
            Volver a proyectos
          </Link>
        </Button>

        {!isFreelancer ? (
          <EmptyState title="Vista disponible solo para freelancers" detail="Inicia sesión como freelancer para ver proyectos MYPE." />
        ) : loading ? (
          <div className="grid place-items-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error || !project ? (
          <EmptyState title="No pudimos cargar el proyecto" detail={error ?? "Proyecto no encontrado."} />
        ) : (
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.8fr]">
            <Card className="rounded-2xl p-6 shadow-soft">
              <Badge className="bg-secondary/15 text-secondary">{project.category ?? "Proyecto MYPE"}</Badge>
              <h1 className="mt-3 font-display text-4xl font-extrabold tracking-normal">{project.title}</h1>
              <p className="mt-4 leading-relaxed text-muted-foreground">{project.description}</p>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <Info label="Presupuesto" value={formatBudget(project)} />
                <Info label="Entrega" value={project.expected_delivery_days ? `${project.expected_delivery_days} dias` : "No definida"} />
                <Info label="Vistas" value={String(project.views_count ?? 0)} />
              </div>
            </Card>

            <Card className="rounded-2xl p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <ProfileAvatar
                  src={project.mype.photo_url ?? project.mype.profile_photo}
                  name={project.mype.name}
                  className="h-14 w-14 rounded-2xl"
                  fallbackClassName="bg-secondary/15 text-secondary"
                />
                <div>
                  <div className="font-display text-xl font-bold">{project.mype.name}</div>
                  <div className="text-sm text-muted-foreground">{project.mype.industry ?? "MYPE"}</div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {project.mype.description ?? "Esta MYPE aún no tiene descripción registrada."}
              </p>
              {project.created_at ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  Publicado el {new Date(project.created_at).toLocaleDateString("es-PE")}
                </div>
              ) : null}
              {project.mype.id ? (
                <div className="mt-6 grid gap-2">
                  <Button onClick={() => void contactMype()} disabled={contacting} className="w-full rounded-xl bg-gradient-primary shadow-soft">
                    {contacting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                    Contactar MYPE
                  </Button>
                  <Button asChild variant="outline" className="w-full rounded-xl">
                    <Link to="/dashboard/freelancer/mypes/$mypeId" params={{ mypeId: String(project.mype.id) }}>
                      Ver perfil de la MYPE
                    </Link>
                  </Button>
                </div>
              ) : null}
            </Card>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center shadow-soft">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

function formatBudget(project: ClientProjectDetailPayload): string {
  if (project.budget_min && project.budget_max) return `S/ ${Number(project.budget_min).toFixed(0)} - S/ ${Number(project.budget_max).toFixed(0)}`;
  if (project.budget_min) return `Desde S/ ${Number(project.budget_min).toFixed(0)}`;
  if (project.budget_max) return `Hasta S/ ${Number(project.budget_max).toFixed(0)}`;
  return "No definido";
}
