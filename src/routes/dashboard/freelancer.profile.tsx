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

function FreelancerProfilePage() {
  const token = getToken();
  const user = useMemo(() => getSessionUser(), []);
  const [profile, setProfile] = useState<Partial<ProfilePayload>>({});
  const [skillsText, setSkillsText] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
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

  const visiblePhotoUrl = photoPreviewUrl ?? profile.photo_url ?? null;
  const profileName = user?.name ?? "Alejandro Martinez";

  const requireToken = () => {
    if (!token) setError("Sesion no encontrada. Inicia sesion otra vez.");
    return token;
  };

  const getErrorMessage = (err: unknown, fallback: string) => {
    const payload = err as { message?: string; errors?: Record<string, string[]> };
    const firstError = Object.values(payload?.errors ?? {})[0]?.[0];
    return firstError ?? payload?.message ?? fallback;
  };

  const saveBaseProfile = async () => {
    const t = requireToken();
    if (!t) return;
    setError(null);
    setMessage(null);

    try {
      const response = await api.saveProfile(t, {
        experience_area: profile.experience_area ?? "No especificada",
        location: profile.location ?? null,
        website: profile.website ?? null,
      });
      setProfile(response.data ?? {});
      setMessage("Perfil actualizado.");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo actualizar el perfil."));
    }
  };

  const saveDescription = async () => {
    const t = requireToken();
    if (!t) return;
    setError(null);
    setMessage(null);

    try {
      const response = await api.updateDescription(t, profile.bio ?? profile.description ?? "");
      if (response.data) setProfile(response.data);
      setMessage("Descripcion actualizada.");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo actualizar la descripcion."));
    }
  };

  const saveSkills = async () => {
    const t = requireToken();
    if (!t) return;
    setError(null);
    setMessage(null);

    const skills = skillsText.split(",").map((skill) => skill.trim()).filter(Boolean);

    try {
      const response = await api.updateSkills(t, skills);
      if (response.data) setProfile(response.data);
      setMessage("Habilidades actualizadas.");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudieron guardar las habilidades."));
    }
  };

  const saveSocial = async () => {
    const t = requireToken();
    if (!t) return;
    setError(null);
    setMessage(null);

    try {
      const response = await api.updateSocialLinks(t, {
        linkedin: socialLinks.linkedin || null,
        instagram: socialLinks.instagram || null,
        facebook: socialLinks.facebook || null,
        x: socialLinks.x || null,
        website: socialLinks.website || null,
      });
      if (response.data) setProfile(response.data);
      setMessage("Redes sociales actualizadas.");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudieron actualizar las redes."));
    }
  };

  const selectPhoto = (file: File | null) => {
    setSelectedPhoto(file);
    setMessage(null);
    setError(null);
    setPhotoPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const savePhoto = async () => {
    const t = requireToken();
    if (!t || !selectedPhoto) return;
    setError(null);
    setMessage(null);

    try {
      const response = await api.updatePhoto(t, selectedPhoto);
      if (response.data) setProfile(response.data);
      setSelectedPhoto(null);
      setMessage("Foto actualizada.");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo subir la foto."));
    }
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
              <div className="relative grid h-36 w-36 place-items-center rounded-full border-[7px] border-secondary/80 bg-muted">
                {visiblePhotoUrl ? <img src={visiblePhotoUrl} alt="Foto de perfil" className="h-full w-full rounded-full object-cover" /> : <UserRound className="h-16 w-16 text-muted-foreground" />}
                <span className="absolute bottom-2 right-1 grid h-9 w-9 place-items-center rounded-full bg-foreground text-background">
                  <Camera className="h-4 w-4" />
                </span>
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold tracking-normal">{profileName}</h2>
                <p className="text-muted-foreground">{profile.experience_area || "Desarrollador Frontend React"}</p>
                <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {profile.location || "Lima, Peru"}</p>
                <span className="mt-3 inline-flex rounded-lg bg-success/15 px-3 py-1 text-xs font-bold text-success">Visible al publico</span>
              </div>
            </div>

            <div className="border-l border-border pl-6">
              <div className="flex items-center justify-between text-sm font-bold">
                <span>Perfil completado</span>
                <span className="text-secondary">78%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
                <div className="h-full w-[78%] rounded-full bg-secondary" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Muy buen progreso. Solo falta un poco mas.</p>
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
              <Button onClick={saveBaseProfile} className="rounded-xl bg-gradient-primary shadow-soft"><Save className="h-4 w-4" /> Guardar perfil</Button>
            </div>
          </Card>

          <Card className="rounded-2xl p-5 shadow-soft">
            <PanelTitle icon={UserRound} title="Descripcion personal" />
            <Textarea value={profile.bio ?? profile.description ?? ""} onChange={(event) => setProfile((prev) => ({ ...prev, bio: event.target.value }))} placeholder="Cuéntanos sobre ti y tu propuesta de valor" className="mt-5 min-h-36 resize-none rounded-xl" />
            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Se claro, especifico y muestra como ayudas a tus clientes.</p>
              <Button onClick={saveDescription} className="rounded-xl bg-gradient-primary shadow-soft"><Save className="h-4 w-4" /> Guardar descripcion</Button>
            </div>
          </Card>

          <Card className="rounded-2xl p-5 shadow-soft">
            <PanelTitle icon={Sparkles} title="Habilidades" />
            <div className="mt-4 flex flex-wrap gap-2">
              {skillsText.split(",").map((skill) => skill.trim()).filter(Boolean).map((skill) => (
                <span key={skill} className="rounded-lg bg-secondary px-3 py-1 text-xs font-bold text-white">{skill}</span>
              ))}
            </div>
            <Input value={skillsText} onChange={(event) => setSkillsText(event.target.value)} placeholder="React, Next.js, TypeScript, Figma" className="mt-4 h-11 rounded-xl" />
            <div className="mt-5 flex justify-end">
              <Button onClick={saveSkills} className="rounded-xl bg-gradient-primary shadow-soft"><Save className="h-4 w-4" /> Guardar habilidades</Button>
            </div>
          </Card>

          <Card className="rounded-2xl p-5 shadow-soft">
            <PanelTitle icon={ImageUp} title="Foto de perfil" />
            <div className="mt-5 grid gap-5 md:grid-cols-[1fr_180px]">
              <label className="grid min-h-40 cursor-pointer place-items-center rounded-2xl border border-dashed border-muted-foreground/40 bg-background/50 text-center text-sm text-muted-foreground">
                <input type="file" accept="image/*" className="hidden" onChange={(event) => selectPhoto(event.target.files?.[0] ?? null)} />
                <span><ImageUp className="mx-auto mb-2 h-8 w-8 text-foreground" />Arrastra tu foto aqui<br />o haz clic para seleccionar</span>
              </label>
              <div className="grid place-items-center rounded-2xl bg-muted">
                {visiblePhotoUrl ? <img src={visiblePhotoUrl} alt="Vista previa" className="h-32 w-32 rounded-full object-cover" /> : <UserRound className="h-16 w-16 text-muted-foreground" />}
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={savePhoto} disabled={!selectedPhoto} className="rounded-xl bg-gradient-primary shadow-soft"><ImageUp className="h-4 w-4" /> Subir foto</Button>
            </div>
          </Card>

          <Card className="rounded-2xl p-5 shadow-soft">
            <PanelTitle icon={Globe2} title="Redes sociales" />
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {(["linkedin", "instagram", "facebook", "x", "website"] as const).map((key) => (
                <Input key={key} value={socialLinks[key]} onChange={(event) => setProfile((prev) => ({ ...prev, social_links: { ...(prev.social_links ?? {}), [key]: event.target.value } }))} placeholder={key === "x" ? "X / Twitter" : key} className="h-11 rounded-xl" />
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={saveSocial} className="rounded-xl bg-gradient-primary shadow-soft"><Save className="h-4 w-4" /> Guardar redes</Button>
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
      <CheckCircle2 className={`mt-0.5 h-5 w-5 ${color}`} />
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
