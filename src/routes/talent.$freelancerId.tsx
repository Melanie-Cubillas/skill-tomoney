import { Link, createFileRoute } from "@tanstack/react-router";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { api, resolveAssetUrl, type CatalogPortfolioItem, type FreelancerDetailPayload } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  ArrowLeft,
  Briefcase,
  ExternalLink,
  FolderKanban,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Wallet,
  X,
} from "lucide-react";

export const Route = createFileRoute("/talent/$freelancerId")({
  head: () => ({
    meta: [
      { title: "Portafolio del freelancer · SkilltoMoney" },
      {
        name: "description",
        content: "Explora el portafolio por categorias de un freelancer registrado.",
      },
    ],
  }),
  component: FreelancerPortfolioPage,
});

type SortOption = "featured" | "recent" | "alphabetical";

function FreelancerPortfolioPage() {
  const token = getToken();
  const { freelancerId } = Route.useParams();

  const [freelancer, setFreelancer] = useState<FreelancerDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  useEffect(() => {
    let active = true;

    const loadFreelancer = async () => {
      if (!token) {
        if (active) {
          setFreelancer(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.getCatalogItem(token, Number(freelancerId));

        if (!active) return;

        setFreelancer(response.data ?? null);
      } catch (err) {
        if (!active) return;

        const payload = err as { message?: string };
        setError(payload?.message ?? "No se pudo cargar el portafolio del freelancer.");
        setFreelancer(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadFreelancer();

    return () => {
      active = false;
    };
  }, [freelancerId, token]);

  const categories = useMemo(() => {
    if (!freelancer) return ["Todas"];

    const unique = Array.from(
      new Set(
        freelancer.portfolio.map((project) => project.category?.trim() || "Sin categoria"),
      ),
    ).sort((a, b) => a.localeCompare(b));

    return ["Todas", ...unique];
  }, [freelancer]);

  const visibleProjects = useMemo(() => {
    if (!freelancer) return [];

    let projects = [...freelancer.portfolio];

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      projects = projects.filter((project) => {
        const category = project.category?.toLowerCase() ?? "";
        const description = project.description?.toLowerCase() ?? "";

        return (
          project.title.toLowerCase().includes(query) ||
          description.includes(query) ||
          category.includes(query)
        );
      });
    }

    if (categoryFilter !== "Todas") {
      projects = projects.filter(
        (project) => (project.category?.trim() || "Sin categoria") === categoryFilter,
      );
    }

    if (featuredOnly) {
      projects = projects.filter((project) => project.is_featured);
    }

    return projects.sort((a, b) => {
      if (sortBy === "alphabetical") {
        return a.title.localeCompare(b.title);
      }

      if (sortBy === "recent") {
        const left = a.created_at ? new Date(a.created_at).getTime() : 0;
        const right = b.created_at ? new Date(b.created_at).getTime() : 0;
        return right - left;
      }

      const featuredDiff = Number(b.is_featured) - Number(a.is_featured);
      if (featuredDiff !== 0) return featuredDiff;

      return a.project_order - b.project_order || a.title.localeCompare(b.title);
    });
  }, [categoryFilter, featuredOnly, freelancer, search, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("Todas");
    setFeaturedOnly(false);
    setSortBy("featured");
  };

  const stats = useMemo(() => {
    const totalProjects = freelancer?.portfolio.length ?? 0;
    const featuredProjects = freelancer?.portfolio.filter((item) => item.is_featured).length ?? 0;

    return {
      totalProjects,
      featuredProjects,
      rating: Number(freelancer?.rating ?? 0).toFixed(1),
      completedJobs: freelancer?.completed_jobs ?? 0,
      suggestedRate: formatHourlyRate(freelancer?.suggested_rate ?? null, freelancer?.rate_amount),
    };
  }, [freelancer]);

  const hasFilters = search || categoryFilter !== "Todas" || featuredOnly || sortBy !== "featured";
  const primaryLink = freelancer?.website || getFirstSocialLink(freelancer?.social_links ?? null);

  return (
    <Shell>
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <Link
            to="/talent"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a freelancers
          </Link>

          <div className="mt-5">
            <Badge className="bg-accent text-accent-foreground">Marketplace</Badge>
            <h1 className="mt-3 font-display text-4xl font-bold">Portafolio del freelancer</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Revisa proyectos organizados por categorias y encuentra rapidamente trabajos
              alineados a lo que tu MYPE necesita.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {!token ? (
          <EmptyState
            title="Inicia sesion para ver el portafolio"
            description="Esta vista usa informacion real del freelancer y requiere una sesion activa."
          />
        ) : loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <EmptyState title="No pudimos cargar el portafolio" description={error} />
        ) : !freelancer ? (
          <EmptyState
            title="Freelancer no encontrado"
            description="No encontramos informacion disponible para este portafolio."
          />
        ) : (
          <div className="space-y-8">
            <Card className="overflow-hidden rounded-3xl border-border/70 p-6 shadow-soft">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex flex-1 items-start gap-4">
                  <div className="relative shrink-0">
                    <ProfileAvatar
                      src={freelancer.photo_url ?? freelancer.profile_photo}
                      name={freelancer.name}
                      className="h-24 w-24 rounded-3xl text-3xl shadow-soft"
                    />
                    <span className="absolute right-2 top-2 h-3.5 w-3.5 rounded-full bg-success ring-4 ring-background" />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-display text-3xl font-bold">{freelancer.name}</h2>
                      {freelancer.availability_status ? (
                        <Badge variant="secondary" className="rounded-full px-3 py-1">
                          {freelancer.availability_status}
                        </Badge>
                      ) : null}
                    </div>

                    <p className="mt-2 text-sm font-medium text-muted-foreground">
                      {freelancer.headline ?? freelancer.experience_area ?? "Freelancer digital"}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current text-warning" />
                        {stats.rating} de valoracion
                      </span>
                      {freelancer.location ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {freelancer.location}
                        </span>
                      ) : null}
                      {freelancer.category ? (
                        <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                          {freelancer.category}
                        </span>
                      ) : null}
                    </div>

                    {freelancer.skills.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {freelancer.skills.slice(0, 6).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {freelancer.bio ? (
                      <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
                        {freelancer.bio}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 lg:w-[260px]">
                  {primaryLink ? (
                    <Button asChild className="w-full bg-gradient-primary shadow-soft">
                      <a href={primaryLink} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Ver enlace del freelancer
                      </a>
                    </Button>
                  ) : null}

                  <Button asChild variant="outline" className="w-full">
                    <Link to="/talent">Volver al listado</Link>
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<FolderKanban className="h-5 w-5 text-emerald-500" />}
                title={`${stats.totalProjects}`}
                subtitle="Proyectos en portafolio"
                helper={`${stats.featuredProjects} destacados`}
              />
              <StatCard
                icon={<Star className="h-5 w-5 text-amber-500" />}
                title={stats.rating}
                subtitle="Valoracion promedio"
                helper="Segun el perfil registrado"
              />
              <StatCard
                icon={<Briefcase className="h-5 w-5 text-sky-500" />}
                title={`${stats.completedJobs}`}
                subtitle="Trabajos completados"
                helper="Dato visible para clientes"
              />
              <StatCard
                icon={<Wallet className="h-5 w-5 text-violet-500" />}
                title={stats.suggestedRate ?? "No definida"}
                subtitle="Tarifa sugerida"
                helper="Referencia por hora"
              />
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[260px] flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9 pr-10"
                    placeholder="Buscar proyectos, categorias o palabras clave..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  {search ? (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Limpiar busqueda"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>

                <Button variant="outline" onClick={() => setShowFilters((value) => !value)}>
                  <SlidersHorizontal className="mr-1.5 h-4 w-4" />
                  Filtros
                </Button>
              </div>

              {showFilters ? (
                <div className="mt-4 grid gap-4 rounded-2xl border border-border bg-background p-4 md:grid-cols-3">
                  <label className="text-sm font-semibold">
                    Categoria
                    <select
                      value={categoryFilter}
                      onChange={(event) => setCategoryFilter(event.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm font-semibold">
                    Ordenar por
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value as SortOption)}
                      className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    >
                      <option value="featured">Destacados primero</option>
                      <option value="recent">Mas recientes</option>
                      <option value="alphabetical">Orden alfabetico</option>
                    </select>
                  </label>

                  <label className="text-sm font-semibold">
                    Mostrar
                    <select
                      value={featuredOnly ? "featured" : "all"}
                      onChange={(event) => setFeaturedOnly(event.target.value === "featured")}
                      className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    >
                      <option value="all">Todos los proyectos</option>
                      <option value="featured">Solo destacados</option>
                    </select>
                  </label>
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setCategoryFilter(category)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        categoryFilter === category
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <span className="text-sm text-muted-foreground">
                  {visibleProjects.length} proyecto{visibleProjects.length !== 1 ? "s" : ""}
                </span>
              </div>

              {hasFilters ? (
                <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                  <span>Filtros activos</span>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <X className="h-3 w-3" />
                    Limpiar filtros
                  </button>
                </div>
              ) : null}
            </div>

            {visibleProjects.length === 0 ? (
              <EmptyState
                title="No hay proyectos para mostrar"
                description="Prueba cambiando la categoria o limpiando los filtros."
              />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visibleProjects.map((project) => (
                  <PortfolioCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </Shell>
  );
}

function StatCard({
  icon,
  title,
  subtitle,
  helper,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  helper: string;
}) {
  return (
    <Card className="rounded-2xl border-border/70 p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-muted p-3">{icon}</div>
        <div>
          <p className="font-display text-2xl font-bold">{title}</p>
          <p className="text-sm font-medium text-foreground">{subtitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
        </div>
      </div>
    </Card>
  );
}

function PortfolioCard({ project }: { project: CatalogPortfolioItem }) {
  return (
    <Card className="group overflow-hidden rounded-3xl border-border/70 p-0 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {resolveAssetUrl(project.image_url) ? (
          <img
            src={resolveAssetUrl(project.image_url) ?? undefined}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <FolderKanban className="h-8 w-8" />
          </div>
        )}

        <div className="absolute left-4 top-4 flex items-center gap-2">
          {project.is_featured ? (
            <Badge className="bg-primary text-primary-foreground">
              <Sparkles className="mr-1 h-3 w-3" />
              Destacado
            </Badge>
          ) : null}
        </div>

        {project.external_url ? (
          <a
            href={project.external_url}
            target="_blank"
            rel="noreferrer"
            className="absolute right-4 top-4 rounded-full bg-background/90 p-2 text-foreground shadow-soft transition hover:bg-background"
            aria-label={`Abrir enlace de ${project.title}`}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </div>

      <div className="space-y-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {project.category ?? "Sin categoria"}
          </p>
          <h3 className="mt-2 font-display text-xl font-semibold leading-tight">{project.title}</h3>
        </div>

        <p className="line-clamp-3 min-h-[72px] text-sm leading-6 text-muted-foreground">
          {project.description || "Proyecto sin descripcion registrada."}
        </p>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs text-muted-foreground">
            {formatProjectDate(project.created_at)}
          </span>

          {project.external_url ? (
            <a
              href={project.external_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Ver detalle
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <span className="text-sm font-semibold text-muted-foreground">Proyecto interno</span>
          )}
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="py-20 text-center">
      <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function formatHourlyRate(rate: string | null, amount?: number | null): string | null {
  const value = rate?.trim() || (amount !== null && amount !== undefined ? String(amount) : "");

  if (!value) return null;

  return /^s\/?\s*/i.test(value) ? value : `S/ ${value}`;
}

function formatProjectDate(date: string | null): string {
  if (!date) return "Sin fecha";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Sin fecha";

  return parsed.toLocaleDateString("es-PE", {
    month: "short",
    year: "numeric",
  });
}

function getFirstSocialLink(links: Record<string, string | null> | null): string | null {
  if (!links) return null;

  for (const value of Object.values(links)) {
    if (value?.trim()) {
      return value;
    }
  }

  return null;
}
