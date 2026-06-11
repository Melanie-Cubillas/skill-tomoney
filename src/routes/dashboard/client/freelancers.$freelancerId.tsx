import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Briefcase, ExternalLink, FolderKanban, Loader2, MessageSquare, Star } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, resolveAssetUrl, type FreelancerDetailPayload } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/client/freelancers/$freelancerId")({
  head: () => ({ meta: [{ title: "Perfil freelancer - SkilltoMoney" }] }),
  component: ClientFreelancerDetailPage,
});

function ClientFreelancerDetailPage() {
  const navigate = useNavigate();
  const token = getToken();
  const user = getSessionUser();
  const isMype = user?.account_type === "mype";
  const { freelancerId } = Route.useParams();
  const [contacting, setContacting] = useState(false);
  const [freelancer, setFreelancer] = useState<FreelancerDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !isMype) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.getCatalogItem(token, Number(freelancerId));
        setFreelancer(response.data ?? null);
      } catch (err: unknown) {
        const payload = err as { message?: string };
        setError(payload?.message ?? "No se pudo cargar el perfil del freelancer.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [freelancerId, isMype, token]);

  const contactFreelancer = useCallback(async () => {
    if (!token || contacting) return;
    setContacting(true);
    try {
      const res = await api.createConversation(token, {
        freelancer_profile_id: Number(freelancerId),
        message: "Hola, me interesa tu perfil. Podemos hablar?",
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
  }, [contacting, freelancerId, navigate, token]);

  const avatar = resolveAssetUrl(freelancer?.photo_url ?? freelancer?.profile_photo);
  const topProjects = useMemo(
    () => [...(freelancer?.portfolio ?? [])].sort((a, b) => Number(b.is_featured) - Number(a.is_featured)).slice(0, 3),
    [freelancer],
  );

  if (!isMype) {
    return (
      <DashboardShell role="client">
        <EmptyState title="Vista disponible solo para MYPES" detail="Inicia sesion como MYPE para ver perfiles freelancer." />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="client">
      <div className="space-y-6">
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/dashboard/client/search">
            <ArrowLeft className="h-4 w-4" />
            Volver a busqueda
          </Link>
        </Button>

        {loading ? (
          <div className="grid place-items-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error || !freelancer ? (
          <EmptyState title="No pudimos cargar el perfil" detail={error ?? "Freelancer no encontrado."} />
        ) : (
          <>
            <Card className="rounded-2xl p-6 shadow-soft">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                  {avatar ? (
                    <img src={avatar} alt={freelancer.name} className="h-20 w-20 rounded-2xl object-cover" />
                  ) : (
                    <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-primary text-xl font-bold text-primary-foreground">
                      {freelancer.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h1 className="font-display text-4xl font-extrabold tracking-normal">{freelancer.name}</h1>
                    <p className="mt-1 text-secondary">{freelancer.headline ?? freelancer.category ?? "Freelancer"}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(freelancer.skills ?? []).slice(0, 8).map((skill) => (
                        <Badge key={skill} variant="outline" className="border-secondary/30 text-secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm">
                    <div className="flex items-center gap-1 font-bold">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      {Number(freelancer.rating ?? 0).toFixed(1)}
                    </div>
                    <div className="mt-1 text-muted-foreground">{freelancer.completed_jobs ?? 0} trabajos completados</div>
                    <div className="mt-1 text-muted-foreground">{freelancer.views_count ?? 0} vistas</div>
                  </div>
                  <Button
                    onClick={() => void contactFreelancer()}
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
              <p className="mt-6 max-w-4xl text-sm leading-relaxed text-muted-foreground">
                {freelancer.bio ?? "Este freelancer aun no tiene descripcion registrada."}
              </p>
            </Card>

            <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
              <Card className="rounded-2xl p-5 shadow-soft">
                <div className="mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-secondary" />
                  <h2 className="font-display text-xl font-bold">Servicios publicados</h2>
                </div>
                <div className="space-y-3">
                  {freelancer.services?.map((service) => (
                    <div key={service.id} className="rounded-xl border border-border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="font-bold">{service.title}</div>
                          <div className="text-xs text-muted-foreground">{service.category ?? "Sin categoria"}</div>
                        </div>
                        <Badge className="bg-secondary/15 text-secondary">S/ {Number(service.price).toFixed(0)}</Badge>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
                      <Button asChild variant="outline" size="sm" className="mt-3 rounded-xl">
                        <Link to="/dashboard/client/services/$serviceId" params={{ serviceId: String(service.id) }}>
                          Ver detalle
                        </Link>
                      </Button>
                    </div>
                  ))}
                  {(!freelancer.services || freelancer.services.length === 0) ? (
                    <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No tiene servicios publicados.</p>
                  ) : null}
                </div>
              </Card>

              <Card className="rounded-2xl p-5 shadow-soft">
                <div className="mb-4 flex items-center gap-2">
                  <FolderKanban className="h-5 w-5 text-secondary" />
                  <h2 className="font-display text-xl font-bold">Top proyectos</h2>
                </div>
                <div className="space-y-3">
                  {topProjects.map((project) => (
                    <div key={project.id} className="rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold">{project.title}</div>
                          <div className="text-xs text-muted-foreground">{project.category ?? "Sin categoria"}</div>
                        </div>
                        {project.external_url ? (
                          <a href={project.external_url} target="_blank" rel="noreferrer" className="text-secondary">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{project.description ?? "Sin descripcion."}</p>
                    </div>
                  ))}
                  {topProjects.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No tiene proyectos publicados.</p>
                  ) : null}
                </div>
              </Card>
            </div>
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
