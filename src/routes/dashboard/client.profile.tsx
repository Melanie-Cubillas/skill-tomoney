import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Building2, CheckCircle2, Globe2, HelpCircle, ImageUp, LinkIcon, Save, ShieldCheck, Store } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { api, type ProfilePayload } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/client/profile")({
  head: () => ({ meta: [{ title: "Perfil MYPE · SkilltoMoney" }] }),
  component: MypeProfilePage,
});

const INDUSTRIES = ["Alimentos y bebidas", "Moda", "Servicios profesionales", "Educacion", "Salud", "Tecnologia", "Retail", "Turismo"];

const isFilled = (value: unknown) => typeof value === "string" ? value.trim().length > 0 : Boolean(value);

function MypeProfilePage() {
  const token = getToken();
  const user = useMemo(() => getSessionUser(), []);
  const [profile, setProfile] = useState<Partial<ProfilePayload>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        const response = await api.getProfile(token);
        setProfile(response.data ?? {});
      } catch {
        setError("No se pudo cargar la informacion del negocio.");
      }
    };

    void load();
  }, [token]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  const visiblePhotoUrl = photoPreviewUrl ?? profile.photo_url ?? null;
  const profileCompletionFields = [
    profile.business_name,
    profile.ruc,
    profile.industry,
    profile.description,
    profile.website,
    profile.location,
    visiblePhotoUrl,
  ];
  const profileCompletion = Math.round((profileCompletionFields.filter(isFilled).length / profileCompletionFields.length) * 100);

  const requireToken = () => {
    if (!token) setError("Sesion no encontrada. Inicia sesion otra vez.");
    return token;
  };

  const getErrorMessage = (err: unknown, fallback: string) => {
    const payload = err as { message?: string; errors?: Record<string, string[]> };
    const firstError = Object.values(payload?.errors ?? {})[0]?.[0];
    return firstError ?? payload?.message ?? fallback;
  };

  const saveAll = async () => {
    const t = requireToken();
    if (!t) return;
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await api.saveProfile(t, {
        business_name: profile.business_name ?? "",
        industry: profile.industry ?? null,
        description: profile.description ?? null,
        website: profile.website ?? null,
        location: profile.location ?? null,
      });

      if (selectedPhoto) {
        await api.updatePhoto(t, selectedPhoto);
      }

      const response = await api.getProfile(t);
      setProfile(response.data ?? {});
      setSelectedPhoto(null);
      setPhotoPreviewUrl(null);
      setMessage("Perfil actualizado.");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudieron guardar los cambios."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell role="client" profilePhotoUrl={visiblePhotoUrl}>
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-normal">Perfil MYPE</h1>
          <p className="mt-1 text-muted-foreground">Gestiona la informacion de tu negocio.</p>
        </div>

        {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p> : null}
        {message ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{message}</p> : null}

        <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            <Card className="rounded-2xl p-5 shadow-soft">
              <div className="flex items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary/15 text-secondary">
                    <Store className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-bold tracking-normal">Completa tu perfil y genera mas confianza</h2>
                    <p className="text-sm text-muted-foreground">Un perfil completo te ayuda a conectar con mas clientes y crecer tu negocio.</p>
                  </div>
                </div>
                <div className="min-w-48">
                  <div className="mb-2 flex justify-between text-sm"><span>Perfil</span><span className="font-bold text-secondary">{profileCompletion}%</span></div>
                  <div className="h-2 rounded-full bg-border"><div className="h-full rounded-full bg-secondary" style={{ width: `${profileCompletion}%` }} /></div>
                </div>
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="rounded-2xl p-5 shadow-soft">
                <PanelTitle icon={Building2} title="Datos del negocio" />
                <div className="mt-5 space-y-4">
                  <Field label="Usuario dueño del perfil">
                    <Input value={user?.name ?? ""} readOnly placeholder="Ej. Juan Perez" className="h-11 rounded-xl bg-muted/40" />
                  </Field>
                  <Field label="Nombre del negocio">
                    <Input value={profile.business_name ?? ""} onChange={(event) => setProfile((prev) => ({ ...prev, business_name: event.target.value }))} placeholder="Ej. Diseño Creativo SAC" className="h-11 rounded-xl" />
                  </Field>
                  <Field label="RUC obligatorio">
                    <Input value={profile.ruc ?? ""} readOnly placeholder="Ej. 20512345678" className="h-11 rounded-xl bg-muted/40" />
                  </Field>
                  <Field label="Rubro del negocio">
                    <Select value={profile.industry ?? ""} onValueChange={(value) => setProfile((prev) => ({ ...prev, industry: value }))}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Selecciona el rubro de tu negocio" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Ubicacion">
                    <Input value={profile.location ?? ""} onChange={(event) => setProfile((prev) => ({ ...prev, location: event.target.value }))} placeholder="Ej. Lima, Peru" className="h-11 rounded-xl" />
                  </Field>
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="rounded-2xl p-5 shadow-soft">
                  <PanelTitle icon={ShieldCheck} title="Descripcion de la empresa" />
                  <Textarea value={profile.description ?? ""} onChange={(event) => setProfile((prev) => ({ ...prev, description: event.target.value.slice(0, 1000) }))} placeholder="Cuentanos brevemente sobre tu empresa, que productos o servicios ofreces..." className="mt-5 min-h-48 resize-none rounded-xl" maxLength={1000} />
                  <div className="mt-3 text-right text-xs text-muted-foreground">{(profile.description ?? "").length}/1000</div>
                </Card>

                <Card className="rounded-2xl p-5 shadow-soft">
                  <PanelTitle icon={LinkIcon} title="Pagina web o red social del negocio" />
                  <Input value={profile.website ?? ""} onChange={(event) => setProfile((prev) => ({ ...prev, website: event.target.value }))} placeholder="Ej: https://tusitio.com o @tunegocio" className="mt-5 h-11 rounded-xl" />
                </Card>
              </div>
            </div>

            <Card className="rounded-2xl p-5 shadow-soft">
              <PanelTitle icon={ImageUp} title="Logo o imagen del negocio" />
              <p className="mt-2 text-sm text-muted-foreground">Sube el logo o una imagen representativa de tu negocio. JPG, PNG o SVG, max. 5MB.</p>
              <div className="mt-6 grid gap-6 md:grid-cols-[1fr_220px]">
                <label className="grid min-h-48 cursor-pointer place-items-center rounded-2xl border border-dashed border-muted-foreground/40 bg-background/50 text-center text-sm text-muted-foreground">
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setSelectedPhoto(file);
                    setPhotoPreviewUrl(file ? URL.createObjectURL(file) : null);
                  }} />
                  <span><ImageUp className="mx-auto mb-2 h-8 w-8 text-secondary" />Arrastra y suelta tu archivo aqui<br />o haz clic para seleccionar</span>
                </label>
                <div className="grid place-items-center rounded-2xl border border-border bg-muted/40 p-4">
                  {visiblePhotoUrl ? <img src={visiblePhotoUrl} alt="Vista previa" className="h-32 w-32 rounded-2xl object-cover" /> : <Store className="h-20 w-20 text-muted-foreground" />}
                  <span className="mt-2 text-xs text-muted-foreground">Vista previa</span>
                </div>
              </div>
            </Card>

            <Card className="flex items-center justify-between rounded-2xl border-secondary/30 bg-secondary/10 p-5 shadow-soft">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary/15 text-secondary"><ShieldCheck className="h-5 w-5" /></span>
                <div>
                  <h2 className="font-display text-lg font-bold tracking-normal">Tu informacion esta protegida</h2>
                  <p className="text-sm text-muted-foreground">Cuidamos tus datos y los usamos solo para mejorar tu experiencia.</p>
                </div>
              </div>
              <div className="hidden gap-8 text-center text-xs md:flex">
                <span>Datos seguros</span>
                <span>Privacidad garantizada</span>
                <span>Sin spam</span>
              </div>
            </Card>

            <Card className="flex items-center justify-between rounded-2xl p-5 shadow-soft">
              <p className="text-sm text-muted-foreground">¡Vas muy bien! Completa tu perfil y empieza a recibir oportunidades.</p>
              <div className="flex gap-3">
                <Button onClick={saveAll} disabled={saving} className="rounded-xl bg-gradient-primary shadow-soft"><Save className="h-4 w-4" /> {saving ? "Guardando..." : "Guardar cambios"}</Button>
              </div>
            </Card>
          </div>

          <aside className="space-y-5">
            <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
              <div className="grid h-44 place-items-center bg-secondary/10">
                <span className="grid h-24 w-24 place-items-center rounded-full bg-foreground text-background"><CheckCircle2 className="h-14 w-14" /></span>
              </div>
              <div className="p-5">
                <h2 className="font-display text-lg font-bold tracking-normal">Consejos para un perfil exitoso</h2>
                <div className="mt-5 space-y-5">
                  {["Completa todos los campos", "Usa un logo profesional", "Describe tu propuesta de valor", "Manten tus datos actualizados"].map((item) => (
                    <div key={item} className="flex gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-secondary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl border-secondary/30 bg-secondary/10 p-5 shadow-soft">
              <HelpCircle className="h-5 w-5 text-secondary" />
              <h2 className="mt-3 font-display text-base font-bold tracking-normal">¿Necesitas ayuda?</h2>
              <p className="mt-2 text-sm text-muted-foreground">Visita nuestro Centro de ayuda para mas informacion.</p>
              <a className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-secondary">
                Ir al Centro de ayuda <Globe2 className="h-4 w-4" />
              </a>
            </Card>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}

function PanelTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-normal">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary/15 text-secondary"><Icon className="h-4 w-4" /></span>
      {title}
    </h2>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
