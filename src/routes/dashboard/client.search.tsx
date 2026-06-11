import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Heart, Loader2, MapPin, MessageSquare, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, resolveAssetUrl, type FreelancerItem } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/client/search")({
  head: () => ({ meta: [{ title: "Buscar freelancers - SkilltoMoney" }] }),
  component: ClientSearchPage,
});

const CATEGORIES = [
  "Diseno Grafico",
  "Edicion de Video",
  "Marketing",
  "Desarrollo Web",
  "UX/UI",
  "Skill Bot & Automatización",
];

function ClientSearchPage() {
  const navigate = useNavigate();
  const token = getToken();
  const user = getSessionUser();
  const isMype = user?.account_type === "mype";
  const [freelancers, setFreelancers] = useState<FreelancerItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [favLoading, setFavLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [skill, setSkill] = useState("");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [minRating, setMinRating] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [contactingId, setContactingId] = useState<number | null>(null);

  const loadFreelancers = useCallback(async () => {
    if (!token || !isMype) {
      setFreelancers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string | number> = { per_page: 12 };
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (skill.trim()) params.skill = skill.trim();
      if (minRate) params.min_rate = minRate;
      if (maxRate) params.max_rate = maxRate;
      if (minRating) params.min_rating = minRating;

      const response = await api.getCatalog(token, params);
      setFreelancers(response.data?.freelancers ?? []);
    } catch (err: unknown) {
      const payload = err as { message?: string };
      setError(payload?.message ?? "No se pudieron cargar los freelancers.");
      setFreelancers([]);
    } finally {
      setLoading(false);
    }
  }, [category, isMype, maxRate, minRate, minRating, search, skill, token]);

  const loadFavorites = useCallback(async () => {
    if (!token || !isMype) return;

    try {
      const response = await api.getFavorites(token);
      setFavoriteIds(new Set((response.data?.favorites ?? []).map((item) => item.id)));
    } catch {
      setFavoriteIds(new Set());
    }
  }, [isMype, token]);

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
        setFavoriteIds((current) => {
          const next = new Set(current);
          next.delete(freelancerId);
          return next;
        });
      } else {
        await api.addFavorite(token, freelancerId);
        setFavoriteIds((current) => new Set(current).add(freelancerId));
      }
    } finally {
      setFavLoading(null);
    }
  };

  const contactFreelancer = async (freelancerId: number) => {
    if (!token || contactingId !== null) return;
    setContactingId(freelancerId);
    try {
      const res = await api.createConversation(token, {
        freelancer_profile_id: freelancerId,
        message: "Hola, me interesa tus servicios. Podemos hablar?",
      });
      await navigate({
        to: "/dashboard/messages",
        search: { conversation: res.data?.conversation.id },
      });
    } catch {
      // silent
    } finally {
      setContactingId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setSkill("");
    setMinRate("");
    setMaxRate("");
    setMinRating("");
  };

  if (!isMype) {
    return (
      <DashboardShell role="client">
        <EmptyState title="Vista disponible solo para MYPES" detail="Inicia sesion como MYPE para buscar freelancers." />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="client">
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-normal">Buscar freelancers</h1>
            <p className="mt-1 text-muted-foreground">
              Encuentra freelancers registrados y filtra por nombre, profesion, habilidades, precio y reputacion.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowFilters((value) => !value)} className="rounded-xl">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
            </Button>
            <Button asChild className="rounded-xl bg-gradient-primary shadow-soft">
              <Link to="/dashboard/client/services">Explorar servicios</Link>
            </Button>
          </div>
        </div>

        <Card className="rounded-2xl p-4 shadow-soft">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre, profesion o descripcion..."
                className="h-11 rounded-xl pl-9 pr-9"
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
            <Button onClick={() => void loadFreelancers()} className="h-11 rounded-xl bg-gradient-primary shadow-soft">
              Buscar
            </Button>
            <Button type="button" variant="outline" onClick={clearFilters} className="h-11 rounded-xl">
              Limpiar
            </Button>
          </div>

          {showFilters ? (
            <div className="mt-4 grid gap-3 md:grid-cols-5">
              <label className="text-sm font-semibold">
                Categoria
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="">Todas</option>
                  {CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <FilterInput label="Habilidad" value={skill} onChange={setSkill} placeholder="Ej. Excel, video, React" />
              <FilterInput label="Precio minimo" type="number" value={minRate} onChange={setMinRate} placeholder="30" />
              <FilterInput label="Precio maximo" type="number" value={maxRate} onChange={setMaxRate} placeholder="120" />
              <label className="text-sm font-semibold">
                Reputacion
                <select
                  value={minRating}
                  onChange={(event) => setMinRating(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="">Todas</option>
                  <option value="4">4.0+</option>
                  <option value="4.5">4.5+</option>
                  <option value="4.8">4.8+</option>
                </select>
              </label>
            </div>
          ) : null}
        </Card>

        {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : freelancers.length === 0 ? (
          <EmptyState title="No encontramos freelancers" detail="Prueba con otro nombre, categoria o habilidad." />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {freelancers.map((freelancer) => (
              <FreelancerCard
                key={freelancer.id}
                freelancer={freelancer}
                isFavorite={favoriteIds.has(freelancer.id)}
                favoriteLoading={favLoading === freelancer.id}
                contacting={contactingId === freelancer.id}
                onToggleFavorite={() => void toggleFavorite(freelancer.id)}
                onContact={() => void contactFreelancer(freelancer.id)}
                onOpenProfile={() =>
                  void navigate({
                    to: "/dashboard/client/freelancers/$freelancerId",
                    params: { freelancerId: String(freelancer.id) },
                  })
                }
              />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <Input
        type={type}
        min={type === "number" ? 0 : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 h-10 rounded-lg"
      />
    </label>
  );
}

function FreelancerCard({
  freelancer,
  isFavorite,
  favoriteLoading,
  contacting,
  onToggleFavorite,
  onContact,
  onOpenProfile,
}: {
  freelancer: FreelancerItem;
  isFavorite: boolean;
  favoriteLoading: boolean;
  contacting: boolean;
  onToggleFavorite: () => void;
  onContact: () => void;
  onOpenProfile: () => void;
}) {
  const imageUrl = resolveAssetUrl(freelancer.photo_url ?? freelancer.profile_photo);
  const rate = freelancer.suggested_rate || (freelancer.rate_amount ? `S/ ${freelancer.rate_amount}` : null);

  return (
    <Card className="rounded-2xl p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <img src={imageUrl} alt={freelancer.name} className="h-12 w-12 rounded-2xl object-cover" />
          ) : (
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary text-sm font-bold text-white">
              {freelancer.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="font-display text-lg font-bold">{freelancer.name}</h2>
            <p className="text-sm text-muted-foreground">{freelancer.headline ?? freelancer.category ?? "Freelancer"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleFavorite}
          disabled={favoriteLoading}
          className={`rounded-full p-2 transition ${isFavorite ? "text-red-500" : "text-muted-foreground hover:text-red-400"}`}
          aria-label={isFavorite ? "Quitar de favoritos" : "Guardar favorito"}
        >
          {favoriteLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />}
        </button>
      </div>

      <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">{freelancer.bio ?? "Sin descripción registrada."}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {(freelancer.skills ?? []).slice(0, 5).map((skill) => (
          <span key={skill} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium">
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-2 text-sm text-muted-foreground">
        {freelancer.location ? (
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {freelancer.location}
          </span>
        ) : null}
        <span className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-warning text-warning" />
          {Number(freelancer.rating ?? 0).toFixed(1)} · {freelancer.completed_jobs ?? 0} trabajos
        </span>
      </div>

      <div className="mt-5 grid gap-2">
        <div className="flex items-center justify-between">
          <div className="font-display text-lg font-bold">{rate ?? "Tarifa pendiente"}</div>
          <div className="flex gap-2">
            <Button
              onClick={onContact}
              disabled={contacting}
              variant="outline"
              className="rounded-xl"
            >
              {contacting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
              Contactar
            </Button>
            <Button onClick={onOpenProfile} className="rounded-xl bg-gradient-primary shadow-soft">
              Ver perfil
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center shadow-soft">
      <Search className="mx-auto h-10 w-10 text-muted-foreground" />
      <h2 className="mt-4 font-display text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}


