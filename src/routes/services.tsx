import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { api, type ServiceItem } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Clock, Loader2, Search, SlidersHorizontal, Star, X } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Explorar Servicios · SkilltoMoney" },
      { name: "description", content: "Explora servicios digitales publicados por freelancers." },
    ],
  }),
  component: ServicesPage,
});

const FALLBACK_CATEGORIES = [
  "Diseño gráfico",
  "Edición de video",
  "Marketing",
  "Desarrollo web",
  "UX/UI",
  "IA y Automatización",
];

function ServicesPage() {
  const token = getToken();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [maxDeliveryDays, setMaxDeliveryDays] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const loadServices = useCallback(async () => {
    if (!token) {
      setServices([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params: Record<string, string | number> = { per_page: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (maxDeliveryDays) params.max_delivery_days = maxDeliveryDays;

      const res = await api.getMarketplaceServices(token, params);
      setServices(res.data?.services ?? []);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [category, maxDeliveryDays, maxPrice, minPrice, search, token]);

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

  const hasFilters = search || category || minPrice || maxPrice || maxDeliveryDays;

  return (
    <Shell>
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <Badge className="bg-accent text-accent-foreground">Marketplace</Badge>
          <h1 className="mt-3 font-display text-4xl font-bold">Explorar Servicios</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Encuentra servicios digitales publicados por freelancers registrados en la plataforma.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="relative min-w-[260px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9 pr-10"
                placeholder="Buscar servicios, ej. logo, reels, landing..."
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
            <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="grid gap-4 md:grid-cols-4">
                <label className="text-sm font-semibold">
                  Categoría
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

                <label className="text-sm font-semibold">
                  Precio minimo
                  <Input
                    type="number"
                    min="0"
                    className="mt-1"
                    placeholder="Ej. 100"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                  />
                </label>

                <label className="text-sm font-semibold">
                  Precio maximo
                  <Input
                    type="number"
                    min="0"
                    className="mt-1"
                    placeholder="Ej. 500"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                  />
                </label>

                <label className="text-sm font-semibold">
                  Entrega maxima
                  <Input
                    type="number"
                    min="1"
                    className="mt-1"
                    placeholder="Dias"
                    value={maxDeliveryDays}
                    onChange={(event) => setMaxDeliveryDays(event.target.value)}
                  />
                </label>
              </div>
            </div>
          ) : null}

          {hasFilters ? (
            <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
              <span>
                {services.length} resultado{services.length !== 1 ? "s" : ""}
              </span>
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
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {!token ? (
          <EmptyState
            title="Inicia sesión para explorar servicios"
            description="Esta vista usa servicios reales publicados por freelancers registrados."
          />
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            title="No encontramos servicios"
            description="Prueba ajustando los filtros o busca otro tipo de servicio."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}

function ServiceCard({ service }: { service: ServiceItem }) {
  return (
    <Card className="group overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-elegant">
      <div className="border-b border-border bg-muted/40 p-5">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="secondary">{service.category ?? "Servicio digital"}</Badge>
          <span className="text-xs text-muted-foreground">{service.views_count} vistas</span>
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold leading-snug">{service.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-3">
          <ProfileAvatar
            src={service.freelancer.photo_url ?? service.freelancer.profile_photo}
            name={service.freelancer.name}
            className="h-9 w-9 rounded-full text-xs"
          />
          <div>
            <div className="text-sm font-semibold">{service.freelancer.name}</div>
            <div className="text-xs text-muted-foreground">
              {service.freelancer.headline ?? "Freelancer"}
            </div>
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
              <span className="font-semibold text-foreground">
                {formatRating(service.freelancer.rating)}
              </span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {service.delivery_days}d
            </span>
          </div>
          <div className="font-display font-bold">{formatPrice(service.price, service.currency)}</div>
        </div>

        <Button className="mt-4 w-full bg-gradient-primary shadow-soft">
          Contactar freelancer
        </Button>
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

function formatPrice(price: number, currency: string): string {
  const prefix = currency === "PEN" ? "S/" : currency;
  return `${prefix} ${Number(price).toFixed(0)}`;
}

function formatRating(rating: number | string | null): string {
  if (rating === null || rating === undefined) return "0.0";
  return Number(rating).toFixed(1);
}

