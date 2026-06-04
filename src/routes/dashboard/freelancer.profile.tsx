import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Briefcase, Camera, CheckCircle2, Globe2, ImageUp, LinkIcon, MapPin, Save, Send, ShieldCheck, Sparkles, Star, UserRound } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, type ProfilePayload } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/freelancer/profile")({
  head: () => ({ meta: [{ title: "Perfil Freelancer · SkilltoMoney" }] }),
  component: FreelancerProfilePage,
});

const isFilled = (value: unknown) => {
  if (typeof value !== "string") return Boolean(value);

  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 && normalized !== "no especificada";
};

function FreelancerProfilePage() {
  const token = getToken();
  const user = useMemo(() => getSessionUser(), []);
  const [profile, setProfile] = useState<Partial<ProfilePayload>>({});
  const [skillsText, setSkillsText] = useState("");
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
        if (response.data) {
          setProfile(response.data);
          setSkillsText((response.data.skills ?? []).join(", "));
        }
      } catch {
        setError("No se pudo cargar la informacion del perfil.");
      }
    };

    void load();
  }, [token]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  const socialLinks = useMemo(() => {
    const raw = profile.social_links ?? {};
    return {
      linkedin: raw.linkedin ?? "",
      instagram: raw.instagram ?? "",
      facebook: raw.facebook ?? "",
      x: raw.x ?? "",
      website: raw.website ?? "",
    };
  }, [profile.social_links]);

  const skillNames = useMemo(() => skillsText.split(",").map((skill) => skill.trim()).filter(Boolean), [skillsText]);
  const visiblePhotoUrl = photoPreviewUrl ?? profile.photo_url ?? null;
  const profileName = user?.name ?? "Tu perfil";
  const profileCompletionFields = [
    profile.experience_area,
    profile.location,
    profile.website || socialLinks.website,
    profile.bio ?? profile.description,
    skillNames.length > 0,
    visiblePhotoUrl,
    socialLinks.linkedin,
    socialLinks.instagram,
    socialLinks.facebook,
    socialLinks.x,
  ];
  const profileCompletion = Math.round((profileCompletionFields.filter(isFilled).length / profileCompletionFields.length) * 100);
  const completionHint = profileCompletion >= 100
    ? "Perfil completo. Tus datos estan actualizados."
    : profileCompletion >= 70
      ? "Muy buen progreso. Solo falta un poco mas."
      : "Completa tus campos para mejorar tu visibilidad.";

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
        experience_area: profile.experience_area?.trim() || "No especificada",
        bio: profile.bio ?? profile.description ?? null,
        location: profile.location ?? null,
        website: profile.website || socialLinks.website || null,
        social_links: {
          linkedin: socialLinks.linkedin || null,
          instagram: socialLinks.instagram || null,
          facebook: socialLinks.facebook || null,
          x: socialLinks.x || null,
          website: socialLinks.website || profile.website || null,
        },
      });

      await api.updateSkills(t, skillNames);

      if (selectedPhoto) {
        await api.updatePhoto(t, selectedPhoto);
      }

      const response = await api.getProfile(t);
      if (response.data) {
        setProfile(response.data);
        setSkillsText((response.data.skills ?? []).join(", "));
      }
      setSelectedPhoto(null);
      setPhotoPreviewUrl(null);
      setMessage("Perfil actualizado.");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudieron guardar los cambios."));
    } finally {
      setSaving(false);
    }
  };

  const selectPhoto = (file: File | null) => {
    setSelectedPhoto(file);
    setMessage(null);
    setError(null);
    setPhotoPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  return (
    <DashboardShell role="freelancer" profilePhotoUrl={visiblePhotoUrl}>
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-normal">Perfil freelancer</h1>
          <p className="mt-1 text-muted-foreground">Gestiona tu perfil profesional, habilidades y presencia digital.</p>
        </div>

        {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p> : null}
        {message ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{message}</p> : null}

        <Card className="relative overflow-hidden rounded-2xl p-6 shadow-soft">
          <div className="absolute right-0 top-0 h-full w-80 bg-secondary/10" />
          <div className="relative grid gap-6 lg:grid-cols-[360px_1fr_320px]">
            <div className="flex items-center gap-5">
              <div className="relative h-36 w-36 shrink-0">
                <div className="grid h-full w-full aspect-square place-items-center overflow-hidden rounded-full border-[7px] border-secondary/80 bg-muted">
                  {visiblePhotoUrl ? <img src={visiblePhotoUrl} alt="Foto de perfil" className="h-full w-full rounded-full object-cover" /> : <UserRound className="h-16 w-16 text-muted-foreground" />}
                </div>
                <span className="absolute bottom-2 right-1 grid h-9 w-9 place-items-center rounded-full bg-foreground text-background">
                  <Camera className="h-4 w-4" />
                </span>
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold tracking-normal">{profileName}</h2>
                <p className="text-muted-foreground">{profile.experience_area || "Area sin definir"}</p>
                <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {profile.location || "Ubicacion sin definir"}</p>
                <span className="mt-3 inline-flex rounded-lg bg-success/15 px-3 py-1 text-xs font-bold text-success">Visible al publico</span>
              </div>
            </div>

            <div className="border-l border-border pl-6">
              <div className="flex items-center justify-between text-sm font-bold">
                <span>Perfil completado</span>
                <span className="text-secondary">{profileCompletion}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-secondary" style={{ width: `${profileCompletion}%` }} />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{completionHint}</p>
              <LinkIcon className="mt-5 h-4 w-4 text-secondary" />
            </div>

            <div className="space-y-4 border-l border-border pl-6 text-sm">
              <Checklist title="Verificado" detail="Identidad verificada" color="text-success" />
              <Checklist title="Listo para publicar" detail="Tu perfil puede ser visible" color="text-secondary" />
              <Checklist title="Perfil completo" detail="Agrega 2 proyectos" color="text-warning" />
            </div>
          </div>
        </Card>

        <div className="grid gap-5 xl:grid-cols-2">
          <Card className="rounded-2xl p-5 shadow-soft">
            <PanelTitle icon={UserRound} title="Datos base" />
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Area de experiencia">
                <Input value={profile.experience_area ?? ""} onChange={(event) => setProfile((prev) => ({ ...prev, experience_area: event.target.value }))} placeholder="Desarrollo Web y Software" className="h-11 rounded-xl" />
              </Field>
              <Field label="Website">
                <Input value={profile.website ?? ""} onChange={(event) => setProfile((prev) => ({ ...prev, website: event.target.value }))} placeholder="alejandro.dev" className="h-11 rounded-xl" />
              </Field>
              <Field label="Ubicacion">
                <Input value={profile.location ?? ""} onChange={(event) => setProfile((prev) => ({ ...prev, location: event.target.value }))} placeholder="Lima, Peru" className="h-11 rounded-xl" />
              </Field>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" /> Esta informacion sera visible en tu perfil publico.</p>
            </div>
          </Card>

          <Card className="rounded-2xl p-5 shadow-soft">
            <PanelTitle icon={UserRound} title="Descripcion personal" />
            <Textarea value={profile.bio ?? profile.description ?? ""} onChange={(event) => setProfile((prev) => ({ ...prev, bio: event.target.value }))} placeholder="Cuéntanos sobre ti y tu propuesta de valor" className="mt-5 min-h-36 resize-none rounded-xl" />
            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Se claro, especifico y muestra como ayudas a tus clientes.</p>
            </div>
          </Card>

          <Card className="rounded-2xl p-5 shadow-soft">
            <PanelTitle icon={Sparkles} title="Habilidades" />
            <div className="mt-4 flex flex-wrap gap-2">
              {skillNames.map((skill) => (
                <span key={skill} className="rounded-lg bg-secondary px-3 py-1 text-xs font-bold text-white">{skill}</span>
              ))}
            </div>
            <Input value={skillsText} onChange={(event) => setSkillsText(event.target.value)} placeholder="React, Next.js, TypeScript, Figma" className="mt-4 h-11 rounded-xl" />
          </Card>

          <Card className="rounded-2xl p-5 shadow-soft">
            <PanelTitle icon={ImageUp} title="Foto de perfil" />
            <div className="mt-5 grid gap-5 md:grid-cols-[1fr_180px]">
              <label className="grid min-h-40 cursor-pointer place-items-center rounded-2xl border border-dashed border-muted-foreground/40 bg-background/50 text-center text-sm text-muted-foreground">
                <input type="file" accept="image/*" className="hidden" onChange={(event) => selectPhoto(event.target.files?.[0] ?? null)} />
                <span><ImageUp className="mx-auto mb-2 h-8 w-8 text-foreground" />Arrastra tu foto aqui<br />o haz clic para seleccionar</span>
              </label>
              <div className="grid place-items-center rounded-2xl bg-muted">
                {visiblePhotoUrl ? <img src={visiblePhotoUrl} alt="Vista previa" className="h-32 w-32 shrink-0 aspect-square rounded-full object-cover" /> : <UserRound className="h-16 w-16 text-muted-foreground" />}
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl p-5 shadow-soft">
            <PanelTitle icon={Globe2} title="Redes sociales" />
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {(["linkedin", "instagram", "facebook", "x", "website"] as const).map((key) => (
                <Input key={key} value={socialLinks[key]} onChange={(event) => setProfile((prev) => ({ ...prev, social_links: { ...(prev.social_links ?? {}), [key]: event.target.value } }))} placeholder={key === "x" ? "X / Twitter" : key} className="h-11 rounded-xl" />
              ))}
            </div>
          </Card>

          <Card className="rounded-2xl p-5 shadow-soft">
            <PanelTitle icon={Star} title="Recomendaciones para mejorar" />
            <div className="mt-5 space-y-3">
              <Suggestion icon={Briefcase} title="Agrega 2 proyectos a tu portafolio" />
              <Suggestion icon={Sparkles} title="Completa tus redes profesionales" />
              <Suggestion icon={Send} title="Publica tu perfil para recibir mas solicitudes" />
            </div>
          </Card>
        </div>

        <Card className="flex items-center justify-between rounded-2xl p-5 shadow-soft">
          <p className="text-sm text-muted-foreground">Guarda todos los cambios de tu perfil en una sola accion.</p>
          <Button onClick={saveAll} disabled={saving} className="rounded-xl bg-gradient-primary shadow-soft">
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </Card>
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

function Checklist({ title, detail, color }: { title: string; detail: string; color: string }) {
  return (
    <div className="flex gap-3">
      <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} />
      <div>
        <div className="font-bold">{title}</div>
        <div className="text-xs text-muted-foreground">{detail}</div>
      </div>
    </div>
  );
}

function Suggestion({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-secondary/10 px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-secondary" />
        <span className="font-bold">{title}</span>
      </div>
      <Send className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
