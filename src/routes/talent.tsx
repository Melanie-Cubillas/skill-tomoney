import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
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
import { api, resolveAssetUrl, type FreelancerItem, type RecommendedFreelancerItem } from "@/lib/api";
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
  "Diseño gráfico",
  "Edición de video",
  "Marketing",
  "Desarrollo web",
  "UX/UI",
  "IA y Automatización",
];

function TalentPage() {
  const navigate = useNavigate();
  const token = getToken();
  const user = getSessionUser();
  const isMype = user?.account_type === "mype";

  const [freelancers, setFreelancers] = useState<FreelancerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [minRating, setMinRating] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedFreelancerItem[]>([]);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [favLoading, setFavLoading] = useState<number | null>(null);
  const loadFreelancers = useCallback(async () => {
    if (!token) {
      setFreelancers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (locationFilter) params.location = locationFilter;
      if (minRate) params.min_rate = minRate;
      if (maxRate) params.max_rate = maxRate;
      if (minRating) params.min_rating = minRating;
      params.per_page = 12;

      const res = await api.getCatalog(token, params);

      setFreelancers(res.data?.freelancers ?? []);
    } catch {
      setFreelancers([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, locationFilter, minRate, maxRate, minRating, token]);

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
    setMinRate("");
    setMaxRate("");
    setMinRating("");
    setRecommendations([]);
    setRecommendationError(null);
  };

  const loadRecommendations = async () => {
    if (!token) return;

    setRecommendationLoading(true);
    setRecommendationError(null);

    try {
      const params: Record<string, string | number> = {
        search,
        category,
        max_rate: maxRate,
        min_rating: minRating,
        limit: 6,
      };

      const res = await api.getFreelancerRecommendations(token, params);
      setRecommendations(res.data?.recommendations ?? []);
    } catch {
      setRecommendationError("No se pudieron cargar recomendaciones.");
      setRecommendations([]);
    } finally {
      setRecommendationLoading(false);
    }
  };

  const hasFilters = search || category || locationFilter || minRate || maxRate || minRating;

  return (
    <Shell>
      <section className="relative overflow-hidden border-b border-border bg-gradient-hero py-14 text-primary-foreground">
        <div className="pointer-events-none absolute inset-0 grid-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6">
          <Badge className="bg-white/15 text-primary-foreground backdrop-blur">
            Matching Skill Bot
          </Badge>
          <h1 className="mt-3 font-display text-4xl font-bold">
            Encuentra al freelancer perfecto
          </h1>
          <p className="mt-2 max-w-xl text-white/70">
            Filtra por categoría, precio y ubicación. Skill Bot recomienda el
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
            <Button
              className="bg-gradient-primary shadow-glow"
              disabled={!token || recommendationLoading}
              onClick={loadRecommendations}
            >
              {recommendationLoading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-1.5 h-4 w-4" />
              )}
              Buscar con Skill Bot
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
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-semibold text-white/70">
                    Precio minimo / hora
                  </label>
                  <Input
                    type="number"
                    min="0"
                    className="border-white/20 bg-white/10 text-primary-foreground placeholder:text-white/50 focus-visible:ring-white/30"
                    placeholder="Ej. 30"
                    value={minRate}
                    onChange={(e) => setMinRate(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-semibold text-white/70">
                    Precio maximo / hora
                  </label>
                  <Input
                    type="number"
                    min="0"
                    className="border-white/20 bg-white/10 text-primary-foreground placeholder:text-white/50 focus-visible:ring-white/30"
                    placeholder="Ej. 80"
                    value={maxRate}
                    onChange={(e) => setMaxRate(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-semibold text-white/70">
                    Reputacion minima
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur focus:outline-none focus:ring-1 focus:ring-white/30"
                  >
                    <option value="" className="bg-background text-foreground">Cualquiera</option>
                    <option value="4" className="bg-background text-foreground">4.0+</option>
                    <option value="4.5" className="bg-background text-foreground">4.5+</option>
                    <option value="4.8" className="bg-background text-foreground">4.8+</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {recommendations.length > 0 && token ? (
          <div className="mb-8 rounded-2xl border border-secondary/30 bg-secondary/10 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold">Freelancers recomendados</h2>
                <p className="text-sm text-muted-foreground">
                  Ordenados según tu búsqueda, categoría, presupuesto y reputación.
                </p>
              </div>
              <Sparkles className="h-5 w-5 text-secondary" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {recommendations.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-display font-bold">{item.name}</div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.headline ?? item.category ?? "Freelancer"}
                      </p>
                    </div>
                    <Badge className="bg-secondary text-secondary-foreground">
                      {Math.round(item.score)}%
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(item.skills ?? []).slice(0, 3).map((skill) => (
                      <span key={skill} className="rounded-full bg-muted px-2 py-0.5 text-[11px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {(item.reasons ?? []).slice(0, 2).map((reason) => (
                      <li key={reason}>- {reason}</li>
                    ))}
                  </ul>
                  <Button
                    className="mt-4 w-full bg-gradient-primary shadow-soft"
                    onClick={() => toggleFavorite(item.id)}
                    disabled={!isMype || favLoading === item.id}
                  >
                    {favoriteIds.has(item.id) ? "Guardado" : "Guardar favorito"}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        ) : recommendationError ? (
          <p className="mb-6 text-sm text-red-500">{recommendationError}</p>
        ) : null}

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

        {!token ? (
          <div className="py-20 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-display text-xl font-semibold">
              Inicia sesión para buscar freelancers
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta vista usa freelancers reales registrados y requiere una sesion activa.
            </p>
          </div>
        ) : loading ? (
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
                        <ProfileAvatar
                          src={f.photo_url ?? f.profile_photo}
                          name={f.name}
                          className="h-12 w-12 rounded-2xl shadow-soft"
                        />
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
                    {formatHourlyRate(f.suggested_rate, f.rate_amount) && (
                      <div className="font-display font-bold">
                        {formatHourlyRate(f.suggested_rate, f.rate_amount)}
                        <span className="text-xs font-normal text-muted-foreground">
                          /h
                        </span>
                      </div>
                    )}
                  </div>

                  <Button className="mt-4 w-full bg-gradient-primary shadow-soft">
                    Contactar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={() =>
                      void navigate({
                        to: "/freelancer-portfolio/$freelancerId",
                        params: { freelancerId: String(f.id) },
                      })
                    }
                  >
                    Ver portafolio
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

function formatHourlyRate(rate: string | null, amount?: number | null): string | null {
  const value = rate?.trim() || (amount !== null && amount !== undefined ? String(amount) : "");

  if (!value) return null;

  return /^s\/?\s*/i.test(value) ? value : `S/ ${value}`;
}


