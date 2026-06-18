import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, FileText, Loader2, MessageSquare } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { api, type MypeDetailPayload } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/freelancer/mypes/$mypeId")({
  head: () => ({ meta: [{ title: "Perfil MYPE - SkilltoMoney" }] }),
  component: FreelancerMypeDetailPage,
});

function FreelancerMypeDetailPage() {
  const navigate = useNavigate();
  const token = getToken();
  const user = getSessionUser();
  const isFreelancer = user?.account_type === "freelancer";
  const { mypeId } = Route.useParams();
  const [contacting, setContacting] = useState(false);
  const [mype, setMype] = useState<MypeDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
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
        const response = await api.getMypeItem(token, Number(mypeId));
        setMype(response.data ?? null);
      } catch (err: unknown) {
        const payload = err as { message?: string };
        setError(payload?.message ?? "No se pudo cargar la MYPE.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [isFreelancer, mypeId, token]);

  const contactMype = useCallback(async () => {
    if (!token || contacting) return;
    setContacting(true);
    try {
      const res = await api.createConversation(token, {
        mype_profile_id: Number(mypeId),
        message: "Hola, me interesa trabajar contigo. Podemos coordinar?",
      });
      await navigate({
        to: "/dashboard/messages",
        search: { conversation: res.data?.conversation.id },
      });
    } catch {
      // silent
    } finally {
      setContacting(false);
    }
  }, [contacting, mypeId, navigate, token]);

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
          <EmptyState title="Vista disponible solo para freelancers" detail="Inicia sesión como freelancer para ver MYPES." />
        ) : loading ? (
          <div className="grid place-items-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error || !mype ? (
          <EmptyState title="No pudimos cargar la MYPE" detail={error ?? "MYPE no encontrada."} />
        ) : (
          <>
            <Card className="rounded-2xl p-6 shadow-soft">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                  <ProfileAvatar
                    src={mype.photo_url ?? mype.profile_photo}
                    name={mype.name}
                    className="h-20 w-20 rounded-2xl"
                    fallbackClassName="bg-secondary/15 text-secondary"
                  />
                  <div>
                    <h1 className="font-display text-4xl font-extrabold tracking-normal">{mype.name}</h1>
                    <p className="mt-1 text-secondary">{mype.industry ?? "MYPE"}</p>
                    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                      {mype.description ?? "Esta MYPE aún no tiene descripción registrada."}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                    {mype.views_count ?? 0} vistas
                  </div>
                  <Button
                    onClick={() => void contactMype()}
                    disabled={contacting}
                    className="w-full rounded-xl bg-gradient-primary shadow-soft"
                  >
                    {contacting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                    Contactar
                  </Button>
                </div>
              </div>
              {mype.website ? (
                <a href={mype.website} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-secondary">
                  Web de la empresa <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </Card>

            <Card className="rounded-2xl p-5 shadow-soft">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-secondary" />
                <h2 className="font-display text-xl font-bold">Publicaciones de la MYPE</h2>
              </div>
              <div className="space-y-3">
                {mype.projects.map((project) => (
                  <div key={project.id} className="rounded-xl border border-border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-bold">{project.title}</div>
                        <div className="text-xs text-muted-foreground">{project.category ?? "Sin categoria"}</div>
                      </div>
                      <Badge variant="outline" className="border-secondary/40 text-secondary">{project.status}</Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
                    <Button asChild variant="outline" size="sm" className="mt-3 rounded-xl">
                      <Link to="/dashboard/freelancer/projects/$projectId" params={{ projectId: String(project.id) }}>
                        Ver detalle
                      </Link>
                    </Button>
                  </div>
                ))}
                {mype.projects.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Esta MYPE aún no tiene publicaciones activas.</p>
                ) : null}
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardShell>
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
