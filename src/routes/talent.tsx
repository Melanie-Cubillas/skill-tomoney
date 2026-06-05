import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  Star,
  Sparkles,
  Heart,
  Loader2,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { api, type FreelancerItem } from "@/lib/api";
import { getToken, getSessionUser } from "@/lib/auth";

export const Route = createFileRoute("/talent")({
  head: () => ({
    meta: [
      { title: "Buscar talento · SkilltoMoney" },
      {
        name: "description",
        content: "Encuentra freelancers verificados para tu MYPE.",
      },
    ],
  }),
  component: TalentPage,
});

const CATEGORIES = [
  "Diseño Gráfico",
  "Edición de Video",
  "Marketing",
  "Desarrollo Web",
  "UX/UI",
  "IA & Automatización",
];

function TalentPage() {
  const token = getToken();
  const user = getSessionUser();
  const isMype = user?.account_type === "mype";

  const [freelancers, setFreelancers] = useState<FreelancerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [favLoading, setFavLoading] = useState<number | null>(null);

  const loadFreelancers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (locationFilter) params.location = locationFilter;
      params.per_page = 50;

      const res = token
        ? await api.getCatalog(token, params)
        : await api.getCatalog(token ?? "", params);

      setFreelancers(res.data?.freelancers ?? []);
    } catch {
      setFreelancers([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, locationFilter, token]);

  const loadFavorites = useCallback(async () => {
    if (!token || !isMype) return;
    try {
      const res = await api.getFavorites(token);
      const ids = new Set(
        (res.data?.favorites ?? []).map((f: FreelancerItem) => f.id),
      );
      setFavoriteIds(ids);
    } catch {
      /* ignore */
    }
  }, [token, isMype]);

  useEffect(() => {
    void loadFreelancers();
  }, [loadFreelancers]);

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = async (freelancerId: number) => {
    if (!token || !isMype || favLoading !== null) return;
    setFavLoading(freelancerId);
    try {
      if (favoriteIds.has(freelancerId)) {
        await api.removeFavorite(token, freelancerId);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(freelancerId);
          return next;
        });
      } else {
        await api.addFavorite(token, freelancerId);
        setFavoriteIds((prev) => new Set(prev).add(freelancerId));
      }
    } catch {
      /* ignore */
    } finally {
      setFavLoading(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setLocationFilter("");
  };

  const hasFilters = search || category || locationFilter;

  return (
    <Shell>
      <section className="border-b border-border bg-gradient-hero py-14 text-primary-foreground">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6">
          <Badge className="bg-white/15 text-primary-foreground backdrop-blur">
            Matching IA
          </Badge>
          <h1 className="mt-3 font-display text-4xl font-bold">
            Encuentra al freelancer perfecto
          </h1>
          <p className="mt-2 max-w-xl text-white/70">
            Filtra por categoría, precio y ubicación. Nuestra IA recomienda el
            mejor match para tu proyecto.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 rounded-2xl border border-white/15 bg-white/5 p-2 backdrop-blur">
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
              <Input
                className="border-0 bg-transparent pl-9 text-primary-foreground placeholder:text-white/50 focus-visible:ring-0"
                placeholder="¿Qué necesitas? ej. 'editor reels'"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              className="border-white/20 bg-white/10 text-primary-foreground backdrop-blur hover:bg-white/20"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="mr-1.5 h-4 w-4" />
              Filtros
            </Button>
            <Button className="bg-gradient-primary shadow-glow">
              <Sparkles className="mr-1.5 h-4 w-4" /> Buscar con IA
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-semibold text-white/70">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur focus:outline-none focus:ring-1 focus:ring-white/30"
                  >
                    <option value="">Todas las categorías</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="text-foreground bg-background">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-semibold text-white/70">
                    Ubicación
                  </label>
                  <Input
                    className="border-white/20 bg-white/10 text-primary-foreground placeholder:text-white/50 focus-visible:ring-white/30"
                    placeholder="Lima, Arequipa..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {hasFilters && (
          <div className="mb-6 flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              {freelancers.length} resultado{freelancers.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <X className="h-3 w-3" /> Limpiar filtros
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : freelancers.length === 0 ? (
          <div className="py-20 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-display text-xl font-semibold">
              No encontramos freelancers
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Intenta ajustar los filtros o probar con otra búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {freelancers.map((f) => {
              const isFav = favoriteIds.has(f.id);

              return (
                <Card
                  key={f.id}
                  className="group p-6 transition hover:-translate-y-1 hover:shadow-elegant"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary font-bold text-primary-foreground shadow-soft">
                          {(f.name ?? "F").charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-card bg-success" />
                      </div>
                      <div>
                        <div className="font-display font-semibold">
                          {f.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {f.headline ?? f.experience_area ?? "Freelancer"}
                        </div>
                      </div>
                    </div>

                    {isMype && (
                      <button
                        type="button"
                        onClick={() => toggleFavorite(f.id)}
                        disabled={favLoading === f.id}
                        className={`rounded-full p-1.5 transition ${
                          isFav
                            ? "text-red-500 hover:text-red-600"
                            : "text-muted-foreground/50 hover:text-red-400"
                        }`}
                        aria-label={
                          isFav
                            ? "Quitar de favoritos"
                            : "Agregar a favoritos"
                        }
                      >
                        {favLoading === f.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Heart
                            className={`h-5 w-5 ${
                              isFav ? "fill-current" : ""
                            }`}
                          />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(f.skills ?? []).slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    {f.location && (
                      <>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {f.location}
                        </span>
                        <span>·</span>
                      </>
                    )}
                    {f.category && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                        {f.category}
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
                    <div className="flex items-center gap-1 text-warning">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="font-semibold text-foreground">
                        {f.rating}
                      </span>
                    </div>
                    {f.suggested_rate && (
                      <div className="font-display font-bold">
                        S/ {f.suggested_rate}
                        <span className="text-xs font-normal text-muted-foreground">
                          /h
                        </span>
                      </div>
                    )}
                  </div>

                  <Button className="mt-4 w-full bg-gradient-primary shadow-soft">
                    Contactar
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </Shell>
  );
}
