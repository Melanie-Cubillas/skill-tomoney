import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Clock, Loader2, MessageSquare, Star } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, resolveAssetUrl, type ServiceItem } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/client/services/$serviceId")({
  head: () => ({ meta: [{ title: "Detalle de servicio - SkilltoMoney" }] }),
  component: ClientServiceDetailPage,
});

function ClientServiceDetailPage() {
  const navigate = useNavigate();
  const token = getToken();
  const user = getSessionUser();
  const isMype = user?.account_type === "mype";
  const { serviceId } = Route.useParams();
  const [contacting, setContacting] = useState(false);
  const [service, setService] = useState<ServiceItem | null>(null);
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
        const response = await api.getServiceItem(token, Number(serviceId));
        setService(response.data ?? null);
      } catch (err: unknown) {
        const payload = err as { message?: string };
        setError(payload?.message ?? "No se pudo cargar el servicio.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [isMype, serviceId, token]);

  const contactFreelancer = useCallback(async () => {
    if (!token || contacting || !service?.freelancer.id) return;
    setContacting(true);
    try {
      const res = await api.createConversation(token, {
        freelancer_profile_id: service.freelancer.id,
        message: "Hola, me interesa tu servicio. Podemos hablar?",
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
  }, [contacting, navigate, service?.freelancer.id, token]);

  const imageUrl = resolveAssetUrl(service?.freelancer.photo_url ?? service?.freelancer.profile_photo);

  return (
    <DashboardShell role="client">
      <div className="space-y-6">
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/dashboard/client/services">
            <ArrowLeft className="h-4 w-4" />
            Volver a servicios
          </Link>
        </Button>

        {!isMype ? (
          <EmptyState title="Vista disponible solo para MYPES" detail="Inicia sesion como MYPE para ver servicios." />
        ) : loading ? (
          <div className="grid place-items-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error || !service ? (
          <EmptyState title="No pudimos cargar el servicio" detail={error ?? "Servicio no encontrado."} />
        ) : (
          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="rounded-2xl p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge className="bg-secondary/15 text-secondary">{service.category ?? "Servicio digital"}</Badge>
                  <h1 className="mt-3 font-display text-4xl font-extrabold tracking-normal">{service.title}</h1>
                  <p className="mt-4 leading-relaxed text-muted-foreground">{service.description}</p>
                </div>
                <div className="text-right">
                  <div className="font-display text-3xl font-extrabold">S/ {Number(service.price).toFixed(0)}</div>
                  <div className="mt-1 flex items-center justify-end gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {service.delivery_days} dias
                  </div>
                </div>
              </div>
              <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                {service.views_count} vistas registradas
              </div>
            </Card>

            <Card className="rounded-2xl p-6 shadow-soft">
              <div className="flex items-center gap-3">
                {imageUrl ? (
                  <img src={imageUrl} alt={service.freelancer.name} className="h-14 w-14 rounded-2xl object-cover" />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-sm font-bold text-primary-foreground">
                    {service.freelancer.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-display text-xl font-bold">{service.freelancer.name}</div>
                  <div className="text-sm text-muted-foreground">{service.freelancer.headline ?? "Freelancer"}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {Number(service.freelancer.rating ?? 0).toFixed(1)} - {service.freelancer.completed_jobs ?? 0} trabajos
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {(service.freelancer.skills ?? []).slice(0, 6).map((skill) => (
                  <span key={skill} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium">{skill}</span>
                ))}
              </div>
              {service.freelancer.id ? (
                <div className="mt-6 grid gap-2">
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
                  <Button asChild variant="outline" className="w-full rounded-xl">
                    <Link to="/dashboard/client/freelancers/$freelancerId" params={{ freelancerId: String(service.freelancer.id) }}>
                      Ver perfil del freelancer
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

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center shadow-soft">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}
