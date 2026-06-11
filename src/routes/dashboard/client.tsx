import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Briefcase, CheckCircle2, FileText, Search, Star, Store, Users } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, type ClientProjectPayload, type ProfilePayload } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/client")({
  head: () => ({ meta: [{ title: "Dashboard MYPE - SkilltoMoney" }] }),
  component: ClientRoute,
});

function ClientRoute() {
  const path = useRouterState({ select: (state) => state.location.pathname });

  if (path !== "/dashboard/client") {
    return <Outlet />;
  }

  return <ClientDashboard />;
}

function ClientDashboard() {
  const token = getToken();
  const user = useMemo(() => getSessionUser(), []);
  const [profile, setProfile] = useState<Partial<ProfilePayload>>({});
  const [projects, setProjects] = useState<ClientProjectPayload[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      setLoading(true);
      try {
        const [profileResponse, projectsResponse, favoritesResponse] = await Promise.all([
          api.getProfile(token),
          api.getClientProjects(token),
          api.getFavorites(token).catch(() => ({ data: { favorites: [] } })),
        ]);

        setProfile(profileResponse.data ?? {});
        setProjects(projectsResponse.data?.projects ?? []);
        setFavoritesCount(favoritesResponse.data?.favorites?.length ?? 0);
      } catch {
        setProfile({});
        setProjects([]);
        setFavoritesCount(0);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [token]);

  const businessName = profile.business_name || user?.name || "MYPE";
  const activeProjects = projects.filter((project) => project.status !== "completed" && project.status !== "cancelled").length;
  const publishedProjects = projects.filter((project) => project.status === "published").length;
  const profileCompletion = getProfileCompletion(profile);

  return (
    <DashboardShell role="client" profilePhotoUrl={profile.photo_url ?? null}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-normal">Dashboard MYPE</h1>
            <p className="mt-1 text-sm text-muted-foreground">Hola, {businessName}. Gestiona tus publicaciones y encuentra talento real.</p>
          </div>
          <Button asChild className="rounded-xl bg-gradient-primary shadow-soft">
            <Link to="/dashboard/client/projects">
              <FileText className="h-4 w-4" />
              Mis publicaciones
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          <Metric icon={FileText} label="Publicaciones creadas" value={String(projects.length)} hint="Datos reales de tu cuenta" />
          <Metric icon={Briefcase} label="Proyectos activos" value={String(activeProjects)} hint={`${publishedProjects} publicados`} />
          <Metric icon={Star} label="Favoritos guardados" value={String(favoritesCount)} hint="Freelancers guardados" />
          <Metric icon={Store} label="Dashboard MYPE" value={`${profileCompletion}%`} hint="Completitud del perfil" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
          <Card className="rounded-2xl p-6 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold tracking-normal">Publicaciones recientes</h2>
                <p className="text-sm text-muted-foreground">Solo se muestran proyectos reales creados por tu MYPE.</p>
              </div>
              <Link to="/dashboard/client/projects" className="text-xs font-semibold text-primary">Ver todas</Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-muted-foreground">Cargando publicaciones...</div>
            ) : projects.length === 0 ? (
              <EmptyBlock
                icon={FileText}
                title="Aún no tienes publicaciones"
                detail="Crea tu primer proyecto. En Free puedes publicar 1 proyecto activo."
                actionLabel="Crear proyecto"
                to="/dashboard/client/projects"
              />
            ) : (
              <div className="mt-5 space-y-3">
                {projects.slice(0, 3).map((project) => (
                  <div key={project.id} className="rounded-xl border border-border px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold">{project.title}</div>
                        <div className="text-xs text-muted-foreground">{project.category || "Sin categoría"}</div>
                      </div>
                      <Badge variant="outline" className="border-secondary/40 text-secondary">
                        {statusLabel(project.status)}
                      </Badge>
                    </div>
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>Avance</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link to="/dashboard/client/projects" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-secondary">
              Gestionar mis publicaciones <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>

          <Card className="rounded-2xl p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold tracking-normal">Estado de tu cuenta</h2>
            <div className="mt-5 flex items-center gap-5">
              <div className="grid h-24 w-24 place-items-center rounded-full border-[8px] border-secondary text-2xl font-extrabold">{profileCompletion}%</div>
              <p className="text-sm text-muted-foreground">
                Completa los datos de tu negocio para generar más confianza al contactar freelancers.
              </p>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              {[
                ["Nombre comercial", profile.business_name],
                ["RUC", profile.ruc],
                ["Rubro", profile.industry],
                ["Descripcion", profile.description],
              ].map(([item, value]) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${value ? "text-success" : "text-muted-foreground"}`} />
                  {item}
                </div>
              ))}
            </div>
            <Button asChild className="mt-5 rounded-xl bg-gradient-primary shadow-soft">
              <Link to="/dashboard/client/profile">Editar perfil</Link>
            </Button>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <EmptyBlock
            icon={Search}
            title="Buscar freelancers"
            detail="Filtra por profesion, habilidades, precio y reputacion dentro del dashboard MYPE."
            actionLabel="Buscar talento"
            to="/dashboard/client/search"
          />
          <EmptyBlock
            icon={Users}
            title="Explorar servicios"
            detail="Revisa servicios publicados por freelancers registrados en la plataforma."
            actionLabel="Explorar servicios"
            to="/dashboard/client/services"
          />
        </div>
      </div>
    </DashboardShell>
  );
}

function Metric({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: string; hint: string }) {
  return (
    <Card className="rounded-2xl p-5 shadow-soft">
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary/15 text-secondary">
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-1 font-display text-2xl font-extrabold tracking-normal">{value}</div>
          <div className="mt-1 text-xs font-semibold text-secondary">{hint}</div>
        </div>
      </div>
    </Card>
  );
}

function EmptyBlock({
  icon: Icon,
  title,
  detail,
  actionLabel,
  to,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
  actionLabel: string;
  to: string;
}) {
  return (
    <Card className="rounded-2xl p-6 shadow-soft">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/15 text-secondary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
          <Button asChild variant="outline" className="mt-4 rounded-xl">
            <Link to={to}>{actionLabel}</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function getProfileCompletion(profile: Partial<ProfilePayload>): number {
  const fields = [profile.business_name, profile.ruc, profile.industry, profile.description, profile.website, profile.location, profile.photo_url];
  const completed = fields.filter((value) => typeof value === "string" ? value.trim().length > 0 : Boolean(value)).length;
  return Math.round((completed / fields.length) * 100);
}

function statusLabel(status: ClientProjectPayload["status"]): string {
  const labels: Record<ClientProjectPayload["status"], string> = {
    draft: "Borrador",
    published: "Publicado",
    in_progress: "En progreso",
    completed: "Completado",
    cancelled: "Cancelado",
  };

  return labels[status];
}


