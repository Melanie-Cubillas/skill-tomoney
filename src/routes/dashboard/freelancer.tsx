import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2, ClipboardCheck, FolderKanban, Package, Star, TrendingUp } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, type MarketTrendItem, type PortfolioProjectPayload, type PriceSuggestionPayload, type ProfilePayload, type ServicePayload } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/freelancer")({
  head: () => ({ meta: [{ title: "Dashboard Freelancer - SkilltoMoney" }] }),
  component: FreelancerRoute,
});

function FreelancerRoute() {
  const path = useRouterState({ select: (state) => state.location.pathname });

  if (path !== "/dashboard/freelancer") {
    return <Outlet />;
  }

  return <FreelancerDashboard />;
}

function FreelancerDashboard() {
  const token = getToken();
  const user = useMemo(() => getSessionUser(), []);
  const [profile, setProfile] = useState<Partial<ProfilePayload>>({});
  const [services, setServices] = useState<ServicePayload[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioProjectPayload[]>([]);
  const [marketTrends, setMarketTrends] = useState<MarketTrendItem[]>([]);
  const [priceSuggestion, setPriceSuggestion] = useState<PriceSuggestionPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      setLoading(true);

      try {
        const profileResponse = await api.getProfile(token);
        const profileData = profileResponse.data ?? {};
        const priceCategory = profileData.category ?? profileData.experience_area ?? "";
        const priceSearch = (profileData.skills ?? []).join(" ");

        const [serviceResponse, portfolioResponse, trendsResponse, priceResponse] = await Promise.all([
          api.getFreelancerServices(token),
          api.getPortfolioProjects(token),
          api.getMarketTrends(token).catch(() => ({ data: { trends: [], has_data: false, keywords: [] } })),
          api.getPriceSuggestion(token, { category: priceCategory, search: priceSearch }).catch(() => ({ data: null })),
        ]);

        setProfile(profileData);
        setServices(serviceResponse.data ?? []);
        setPortfolio(portfolioResponse.data ?? []);
        setMarketTrends(trendsResponse.data?.trends ?? []);
        setPriceSuggestion(priceResponse.data ?? null);
      } catch {
        setProfile({});
        setServices([]);
        setPortfolio([]);
        setMarketTrends([]);
        setPriceSuggestion(null);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [token]);

  const firstName = (user?.name ?? "Tu perfil").split(" ")[0] || "Tu perfil";
  const activeServices = services.filter((service) => service.status === "active").length;
  const featuredProjects = portfolio.filter((project) => project.is_featured).length;
  const completionFields = [
    profile.headline,
    profile.bio ?? profile.description,
    profile.experience_area ?? profile.category,
    profile.skills?.length,
    services.length,
    portfolio.length,
    profile.social_links?.linkedin || profile.social_links?.instagram || profile.website,
  ];
  const profileCompletion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  return (
    <DashboardShell role="freelancer" profilePhotoUrl={profile.photo_url ?? null}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-normal">Hola, {firstName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Este es tu resumen real segun tu perfil, servicios y portafolio guardados.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          <Metric icon={Package} label="Servicios" value={String(services.length)} hint={`${activeServices} activos`} tint="teal" />
          <Metric icon={FolderKanban} label="Portafolio" value={String(portfolio.length)} hint={`${featuredProjects} destacados`} tint="blue" />
          <Metric icon={Star} label="Valoracion promedio" value={`${profile.rating ?? "0.00"}`} hint="Dato real del perfil" tint="amber" />
          <Metric icon={ClipboardCheck} label="Trabajos completados" value={`${profile.completed_jobs ?? 0}`} hint="Dato real del perfil" tint="red" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.7fr_0.85fr_0.85fr]">
          <Card className="rounded-2xl p-6 shadow-soft">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold tracking-normal">Dashboard generado</h2>
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard/freelancer/profile">Editar</Link>
              </Button>
            </div>

            <div className="grid gap-5 md:grid-cols-[1fr_220px]">
              <div>
                <p className="text-sm font-semibold text-secondary">
                  {profile.headline ?? "Titulo profesional pendiente"}
                </p>
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-normal">
                  {profile.experience_area ?? profile.category ?? "Area sin definir"}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {profile.bio ?? profile.description ?? "Completa el onboarding para generar una descripcion profesional con Skill Bot."}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {(profile.skills ?? []).slice(0, 8).map((skill) => (
                    <Badge key={skill} variant="outline" className="border-secondary/30 text-secondary">
                      {skill}
                    </Badge>
                  ))}
                  {(profile.skills ?? []).length === 0 ? (
                    <span className="text-sm text-muted-foreground">Sin habilidades guardadas aun.</span>
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <div className="text-sm font-semibold text-muted-foreground">Tarifa sugerida</div>
                <div className="mt-2 font-display text-2xl font-extrabold tracking-normal">
                  {profile.suggested_rate ?? "Pendiente"}
                </div>
                <div className="mt-4 text-sm font-semibold text-muted-foreground">Fuente Skill Bot</div>
                <div className="mt-1 text-sm">{profile.gemini_analysis?.source ?? "Sin análisis"}</div>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold tracking-normal">Completitud del perfil</h2>
            <div className="mt-5 flex items-center gap-5">
              <div className="grid h-24 w-24 shrink-0 aspect-square place-items-center rounded-full border-[8px] border-secondary text-2xl font-extrabold">
                {profileCompletion}%
              </div>
              <p className="text-sm text-muted-foreground">Calculado con datos reales guardados.</p>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <ChecklistLine done={Boolean(profile.bio ?? profile.description)} label="Descripcion personal" />
              <ChecklistLine done={(profile.skills ?? []).length > 0} label="Habilidades guardadas" />
              <ChecklistLine done={services.length > 0} label="Servicio publicado" />
              <ChecklistLine done={portfolio.length > 0} label="Portafolio agregado" />
            </div>
            <Button asChild className="mt-5 rounded-xl bg-gradient-primary shadow-soft">
              <Link to="/dashboard/freelancer/profile">Mejorar perfil</Link>
            </Button>
          </Card>

          <div className="space-y-5">
            <Card className="rounded-2xl border-secondary/30 bg-secondary/10 p-5 shadow-soft">
              <h2 className="font-display text-lg font-bold tracking-normal">Consejo para hoy</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {profile.gemini_analysis?.recomendaciones_mejora?.[0] ??
                  "Completa tu perfil y agrega proyectos para mejorar tu presentación."}
              </p>
              <Link to="/dashboard/freelancer/portfolio" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-secondary">
                Ver portafolio <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>

            <Card className="rounded-2xl p-5 shadow-soft">
              <h2 className="font-display text-lg font-bold tracking-normal">Actividad real</h2>
              <div className="mt-4 space-y-4 text-sm">
                {services[0] ? <Activity icon={Package} title="Servicio creado" detail={services[0].title} /> : null}
                {portfolio[0] ? <Activity icon={FolderKanban} title="Proyecto agregado" detail={portfolio[0].title} /> : null}
                {!services[0] && !portfolio[0] ? (
                  <p className="text-sm text-muted-foreground">{loading ? "Cargando..." : "Aún no hay actividad guardada."}</p>
                ) : null}
              </div>
            </Card>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
          <Card className="rounded-2xl p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold tracking-normal">Tendencias de mercado</h2>
                <p className="text-sm text-muted-foreground">Calculado con publicaciones reales de MYPES, sin Skill Bot.</p>
              </div>
              <TrendingUp className="h-5 w-5 text-secondary" />
            </div>
            <div className="mt-4 space-y-3">
              {marketTrends.slice(0, 4).map((trend) => (
                <div key={trend.label} className="rounded-xl border border-border px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold">{trend.label}</div>
                      <div className="text-xs text-muted-foreground">{trend.demand_count} solicitud{trend.demand_count === 1 ? "" : "es"} similares</div>
                    </div>
                    <Badge variant="outline" className="border-secondary/40 text-secondary">
                      {formatMarketPrice(trend.average_budget)}
                    </Badge>
                  </div>
                  {trend.sample_projects.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {trend.sample_projects.slice(0, 2).map((project) => (
                        <Button key={project.id} asChild size="sm" variant="outline" className="rounded-xl">
                          <Link to="/dashboard/freelancer/projects/$projectId" params={{ projectId: String(project.id) }}>
                            {project.title}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              {marketTrends.length === 0 ? (
                <EmptyState text={loading ? "Cargando tendencias..." : "Aún no hay suficientes publicaciones MYPE relacionadas con tu perfil."} />
              ) : null}
            </div>
          </Card>

          <Card className="rounded-2xl p-5 shadow-soft">
            <h2 className="font-display text-lg font-bold tracking-normal">Rango de precio del mercado</h2>
            <p className="mt-1 text-sm text-muted-foreground">Promedio interno segun publicaciones MYPE relacionadas con tus habilidades.</p>
            {priceSuggestion?.has_data ? (
              <div className="mt-5 rounded-2xl border border-secondary/30 bg-secondary/10 p-4">
                <div className="text-sm text-muted-foreground">Rango sugerido</div>
                <div className="mt-1 font-display text-3xl font-extrabold">
                  S/ {priceSuggestion.recommended_min?.toFixed(0)} - S/ {priceSuggestion.recommended_max?.toFixed(0)}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Promedio S/ {priceSuggestion.average_price?.toFixed(0)} basado en {priceSuggestion.sample_count} publicacion{priceSuggestion.sample_count === 1 ? "" : "es"}.
                </div>
              </div>
            ) : (
              <EmptyState text="Aún no hay datos suficientes para calcular un rango real." />
            )}
          </Card>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <Card className="rounded-2xl p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold tracking-normal">Portafolio</h2>
              <Link to="/dashboard/freelancer/portfolio" className="text-xs font-semibold text-primary">Ver todos</Link>
            </div>
            <div className="mt-4 space-y-3">
              {portfolio.slice(0, 3).map((project) => (
                <div key={project.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
                  <div>
                    <div className="font-bold">{project.title}</div>
                    <div className="text-xs text-muted-foreground">{project.category ?? "Sin categoría"}</div>
                  </div>
                  <Badge variant="outline" className={project.is_featured ? "border-secondary/40 text-secondary" : "border-border text-muted-foreground"}>
                    {project.is_featured ? "Destacado" : "Portafolio"}
                  </Badge>
                </div>
              ))}
              {portfolio.length === 0 ? (
                <EmptyState text={loading ? "Cargando portafolio..." : "Aún no hay proyectos guardados."} />
              ) : null}
            </div>
          </Card>

          <Card className="rounded-2xl p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold tracking-normal">Servicios</h2>
              <Link to="/dashboard/freelancer/services" className="text-xs font-semibold text-primary">Ver todos</Link>
            </div>
            <div className="mt-4 space-y-4">
              {services.slice(0, 2).map((service) => (
                <div key={service.id} className="rounded-xl border border-border px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-bold">{service.title}</div>
                    <Badge variant="outline" className="border-secondary/40 text-secondary">{service.status}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
                  <div className="mt-3 text-sm font-bold">S/ {Number(service.price).toFixed(2)} - {service.delivery_days} días</div>
                </div>
              ))}
              {services.length === 0 ? (
                <EmptyState text={loading ? "Cargando servicios..." : "Aún no hay servicios guardados."} />
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

function ChecklistLine({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className={`h-4 w-4 shrink-0 ${done ? "text-success" : "text-muted-foreground"}`} />
      {label}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
      {text}
    </p>
  );
}

function Metric({ icon: Icon, label, value, hint, tint }: { icon: LucideIcon; label: string; value: string; hint: string; tint: "teal" | "blue" | "amber" | "red" }) {
  const colors = {
    teal: "bg-secondary/15 text-secondary",
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
    red: "bg-red-100 text-primary",
  };

  return (
    <Card className="rounded-2xl p-5 shadow-soft">
      <div className="flex items-center gap-4">
        <span className={`grid h-14 w-14 place-items-center rounded-2xl ${colors[tint]}`}>
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-1 font-display text-2xl font-extrabold tracking-normal">{value}</div>
          <div className="mt-1 text-xs font-semibold text-success">{hint}</div>
        </div>
      </div>
    </Card>
  );
}

function Activity({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary/15 text-secondary">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <div className="font-bold">{title}</div>
        <div className="text-xs text-muted-foreground">{detail}</div>
      </div>
    </div>
  );
}

function formatMarketPrice(value: number | null): string {
  if (!value) return "Sin precio";
  return `Prom. S/ ${Number(value).toFixed(0)}`;
}



