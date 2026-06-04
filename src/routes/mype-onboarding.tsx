import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Bell, Check, Globe2, MapPin, MessageSquare, ShieldCheck, Sparkles, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/auth";

export const Route = createFileRoute("/mype-onboarding")({
  head: () => ({
    meta: [
      { title: "Perfil MYPE · Skill-to-Money" },
      { name: "description", content: "Completa los datos de tu negocio." },
    ],
  }),
  component: MypeOnboarding,
});

const INDUSTRIES = ["Alimentos y bebidas", "Moda", "Servicios profesionales", "Educacion", "Salud", "Tecnologia", "Retail", "Turismo"];

function MypeOnboarding() {
  const navigate = useNavigate();
  const user = useMemo(() => getSessionUser(), []);
  const [businessName, setBusinessName] = useState(user?.name ?? "");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = businessName.trim() && industry && description.trim().length >= 20 && location.trim();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = getToken();

    if (!token) {
      setError("Sesion no encontrada. Inicia sesion otra vez.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.saveProfile(token, {
        business_name: businessName,
        industry,
        description,
        website: website || null,
        location,
      });
      navigate({ to: "/dashboard/client" });
    } catch (err: unknown) {
      const payload = err as { message?: string; errors?: Record<string, string[]> };
      const firstError = Object.values(payload?.errors ?? {})[0]?.[0];
      setError(firstError ?? payload?.message ?? "No se pudo registrar la informacion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
          <Store className="h-5 w-5 text-foreground" />
          Modo MYPE
        </div>
        <div className="flex items-center gap-3">
          <button className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          </button>
          <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground shadow-soft">
            {(businessName || "DA").slice(0, 2).toUpperCase()}
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-[1380px] overflow-hidden px-6 py-9 lg:px-10">
        <div className="pointer-events-none absolute -bottom-28 -right-24 h-72 w-72 rounded-full bg-secondary/20" />
        <div className="pointer-events-none absolute -left-36 top-72 h-72 w-72 rounded-full border border-primary/10" />

        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <span className="inline-flex rounded-lg bg-secondary/15 px-4 py-2 text-sm font-bold text-secondary">
              Paso 2 de 2
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold tracking-normal lg:text-5xl">
              Completa tu perfil <span className="text-primary">MYPE</span>
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              Cuentanos sobre tu negocio para empezar a encontrar el talento ideal.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-5 rounded-2xl border border-border bg-card px-7 py-6 shadow-soft">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-white">
              <Check className="h-5 w-5" />
            </span>
            <span className="text-sm text-muted-foreground">Cuenta creada</span>
            <span className="h-px w-28 border-t border-dashed border-secondary" />
            <span className="grid h-10 w-10 place-items-center rounded-full border border-secondary text-lg font-bold text-secondary">
              2
            </span>
            <span className="text-sm font-bold">Perfil MYPE</span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-8 grid gap-6 lg:grid-cols-2">
          <FormCard icon={Store} title="Informacion del negocio" subtitle="Datos basicos para identificar tu negocio.">
            <div className="grid gap-5 md:grid-cols-2">
              <Field icon={Store} label="Nombre del negocio">
                <Input value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="Ej. Panaderia Dulce Hogar" className="h-12 rounded-xl bg-background/60 pl-10" required />
              </Field>
              <div className="space-y-2">
                <Label>Industria</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="h-12 rounded-xl bg-background/60">
                    <SelectValue placeholder="Selecciona una industria" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </FormCard>

          <FormCard icon={MessageSquare} title="Descripcion" subtitle="Cuentanos que hace tu negocio y que lo hace unico.">
            <div className="relative">
              <MessageSquare className="absolute left-4 top-5 h-4 w-4 text-primary" />
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value.slice(0, 500))}
                placeholder="Ej. Somos una panaderia artesanal que ofrece productos frescos y de calidad..."
                className="min-h-32 resize-none rounded-xl bg-background/60 pl-11 pr-16"
                maxLength={500}
                required
              />
              <span className="absolute bottom-3 right-4 text-xs text-muted-foreground">{description.length}/500</span>
            </div>
          </FormCard>

          <FormCard icon={Globe2} title="Presencia digital" subtitle="Comparte tu sitio web para que puedan conocerte mejor.">
            <Field icon={Globe2} label="Website">
              <Input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="Ej. www.tunegocio.com" className="h-12 rounded-xl bg-background/60 pl-10" />
            </Field>
          </FormCard>

          <FormCard icon={MapPin} title="Ubicacion" subtitle="Indicanos donde se encuentra tu negocio.">
            <Field icon={MapPin} label="Ubicacion">
              <Input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Ej. Lima, Peru" className="h-12 rounded-xl bg-background/60 pl-10" required />
            </Field>
          </FormCard>

          <div className="flex items-center gap-3 border-t border-dashed border-border pt-7 text-sm text-muted-foreground lg:col-span-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary/15 text-secondary">
              <ShieldCheck className="h-4 w-4" />
            </span>
            Tu informacion esta segura con nosotros.
            {error ? <span className="ml-auto text-red-600">{error}</span> : null}
          </div>

          <div className="flex justify-center lg:col-span-2">
            <Button type="submit" size="lg" disabled={!canSubmit || loading} className="min-w-[300px] rounded-xl bg-gradient-primary text-base font-bold shadow-soft">
              <Sparkles className="h-5 w-5" />
              {loading ? "Registrando..." : "Registrar datos"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

function FormCard({ icon: Icon, title, subtitle, children }: { icon: LucideIcon; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-7 flex items-start gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary/15 text-secondary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold tracking-normal">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-primary" />
        {children}
      </div>
    </div>
  );
}
