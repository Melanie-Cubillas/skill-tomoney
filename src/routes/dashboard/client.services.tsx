import { Link, createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock, Loader2, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, resolveAssetUrl, type ServiceItem } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/client/services")({
  head: () => ({ meta: [{ title: "Explorar servicios - SkilltoMoney" }] }),
  component: ClientServicesPage,
});

const FALLBACK_CATEGORIES = [
  "Diseno Grafico",
  "Edicion de Video",
  "Marketing",
  "Desarrollo Web",
  "UX/UI",
  "Skill Bot & Automatización",
];

function ClientServicesPage() {
  const token = getToken();
  const user = getSessionUser();
  const isMype = user?.account_type === "mype";
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [maxDeliveryDays, setMaxDeliveryDays] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  const loadServices = useCallback(async () => {
    if (!token || !isMype) {
      setServices([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string | number> = { per_page: 12 };
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (maxDeliveryDays) params.max_delivery_days = maxDeliveryDays;

      const response = await api.getMarketplaceServices(token, params);
      setServices(response.data?.services ?? []);
    } catch (err: unknown) {
      const payload = err as { message?: string };
      setError(payload?.message ?? "No se pudieron cargar los servicios.");
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [category, isMype, maxDeliveryDays, maxPrice, minPrice, search, token]);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  const categories = useMemo(() => {
    const fromServices = services
      .map((service) => service.category)
      .filter((value): value is string => Boolean(value));

    return Array.from(new Set([...FALLBACK_CATEGORIES, ...fromServices]));
  }, [services]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setMaxDeliveryDays("");
  };

  if (!isMype) {
    return (
      <DashboardShell role="client">
        <EmptyState title="Vista disponible solo para MYPES" detail="Inicia sesion como MYPE para explorar servicios." />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="client">
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-normal">Explorar servicios</h1>
            <p className="mt-1 text-muted-foreground">
              Revisa servicios publicados por freelancers registrados y filtra por categoria, precio o tiempo de entrega.
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowFilters((value) => !value)} className="rounded-xl">
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </Button>
        </div>

        <Card className="rounded-2xl p-4 shadow-soft">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar servicios, ej. logo, reels, landing..."
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
            <Button onClick={() => void loadServices()} className="h-11 rounded-xl bg-gradient-primary shadow-soft">
              Buscar
            </Button>
            <Button type="button" variant="outline" onClick={clearFilters} className="h-11 rounded-xl">
              Limpiar
            </Button>
          </div>

          {showFilters ? (
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <label className="text-sm font-semibold">
                Categoria
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="">Todas</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <FilterInput label="Precio minimo" type="number" value={minPrice} onChange={setMinPrice} placeholder="100" />
              <FilterInput label="Precio maximo" type="number" value={maxPrice} onChange={setMaxPrice} placeholder="500" />
              <FilterInput label="Entrega maxima" type="number" value={maxDeliveryDays} onChange={setMaxDeliveryDays} placeholder="7 dias" />
            </div>
          ) : null}
        </Card>

        {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : services.length === 0 ? (
          <EmptyState title="No encontramos servicios" detail="Prueba ajustando los filtros o busca otro tipo de servicio." />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
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

function ServiceCard({ service }: { service: ServiceItem }) {
  const avatar = service.freelancer.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const imageUrl = resolveAssetUrl(service.freelancer.photo_url ?? service.freelancer.profile_photo);

  return (
    <Card className="overflow-hidden rounded-2xl p-0 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant">
      <div className="border-b border-border bg-muted/30 p-5">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="secondary">{service.category ?? "Servicio digital"}</Badge>
          <span className="text-xs text-muted-foreground">{service.views_count} vistas</span>
        </div>
        <h2 className="mt-4 font-display text-lg font-bold leading-snug">{service.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <img src={imageUrl} alt={service.freelancer.name} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">
              {avatar || "FR"}
            </div>
          )}
          <div>
            <div className="text-sm font-semibold">{service.freelancer.name}</div>
            <div className="text-xs text-muted-foreground">{service.freelancer.headline ?? "Freelancer"}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {(service.freelancer.skills ?? []).slice(0, 3).map((skill) => (
            <span key={skill} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium">
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="flex items-center gap-1 text-warning">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="font-semibold text-foreground">{formatRating(service.freelancer.rating)}</span>
            </span>
            <span>-</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {service.delivery_days}d
            </span>
          </div>
          <div className="font-display font-bold">{formatPrice(service.price, service.currency)}</div>
        </div>

        <div className="mt-4 grid gap-2">
          <Button asChild className="rounded-xl bg-gradient-primary shadow-soft">
            <Link to="/dashboard/client/services/$serviceId" params={{ serviceId: String(service.id) }}>
              Ver detalle del servicio
            </Link>
          </Button>
          {service.freelancer.id ? (
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/dashboard/client/freelancers/$freelancerId" params={{ freelancerId: String(service.freelancer.id) }}>
                Ver perfil del freelancer
              </Link>
            </Button>
          ) : null}
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

function formatPrice(price: number, currency: string): string {
  const prefix = currency === "PEN" ? "S/" : currency;
  return `${prefix} ${Number(price).toFixed(0)}`;
}

function formatRating(rating: number | string | null): string {
  if (rating === null || rating === undefined) return "0.0";
  return Number(rating).toFixed(1);
}

