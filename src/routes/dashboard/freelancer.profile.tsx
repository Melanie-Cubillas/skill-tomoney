import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Briefcase, Camera, CheckCircle2, ChevronDown, Globe2, ImageUp, LinkIcon, MapPin, Save, Send, ShieldCheck, Sparkles, Star, UserRound, X } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, type ProfilePayload, type SkillOptionPayload } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

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
  const [skillOptions, setSkillOptions] = useState<SkillOptionPayload[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<SkillOptionPayload[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        const [profileResponse, skillOptionsResponse] = await Promise.all([
          api.getProfile(token),
          api.getSkillOptions(token),
        ]);

        if (profileResponse.data) {
          setProfile(profileResponse.data);
        }

        if (skillOptionsResponse.data?.items) {
          setSkillOptions(skillOptionsResponse.data.items);
        }

        if (profileResponse.data?.skill_items) {
          const catalogById = new Map(
            (skillOptionsResponse.data?.items ?? []).map((item) => [item.id, item]),
          );

          setSelectedSkills(
            profileResponse.data.skill_items.map((item) => {
              const catalogItem = catalogById.get(item.id);

              return (
                catalogItem ?? {
                  id: item.id,
                  name: item.name,
                  category: item.category,
                  group: "skills",
                  subcategory: null,
                }
              );
            }),
          );
        }
      } catch {
        setError("No se pudo cargar la información del perfil.");
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
    };
  }, [profile.social_links]);

  const areaOptions = useMemo(
    () => skillOptions.filter((item) => item.group === "areas"),
    [skillOptions],
  );
  const availableSkillOptions = useMemo(
    () => skillOptions.filter((item) => item.group === "skills"),
    [skillOptions],
  );
  const skillNames = useMemo(() => selectedSkills.map((skill) => skill.name), [selectedSkills]);
  const visiblePhotoUrl = photoPreviewUrl ?? profile.photo_url ?? null;
  const profileName = user?.name ?? "Tu perfil";
  const profileCompletionFields = [
    profile.experience_area,
    profile.location,
    profile.bio ?? profile.description,
    skillNames.length > 0,
    visiblePhotoUrl,
    socialLinks.linkedin,
    socialLinks.instagram,
  ];
  const profileCompletion = Math.round((profileCompletionFields.filter(isFilled).length / profileCompletionFields.length) * 100);
  const completionHint = profileCompletion >= 100
    ? "Perfil completo. Tus datos estan actualizados."
    : profileCompletion >= 70
      ? "Muy buen progreso. Solo falta un poco más."
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
        website: null,
        social_links: {
          linkedin: socialLinks.linkedin || null,
          instagram: socialLinks.instagram || null,
        },
      });

      await api.updateSkills(
        t,
        selectedSkills.map((skill) => ({ id: skill.id })),
      );

      if (selectedPhoto) {
        await api.updatePhoto(t, selectedPhoto);
      }

      const response = await api.getProfile(t);
      if (response.data) {
        setProfile(response.data);

        setSelectedSkills(
          (response.data.skill_items ?? []).map((item) => {
            const catalogItem = skillOptions.find((option) => option.id === item.id);

            return (
              catalogItem ?? {
                id: item.id,
                name: item.name,
                category: item.category,
                group: "skills",
                subcategory: null,
              }
            );
          }),
        );
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
                <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {profile.location || "Ubicación sin definir"}</p>
                <span className="mt-3 inline-flex rounded-lg bg-success/15 px-3 py-1 text-xs font-bold text-success">Visible al público</span>
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
                <select
                  value={profile.experience_area ?? ""}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, experience_area: event.target.value }))
                  }
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="">Selecciona un area</option>
                  {areaOptions.map((option) => (
                    <option key={`${option.category}-${option.name}`} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Ubicación">
                <Input value={profile.location ?? ""} onChange={(event) => setProfile((prev) => ({ ...prev, location: event.target.value }))} placeholder="Lima, Peru" className="h-11 rounded-xl" />
              </Field>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" /> Esta información sera visible en tu perfil público.</p>
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
            <div className="mt-4">
              <SkillMultiSelect
                options={availableSkillOptions}
                values={selectedSkills}
                onChange={setSelectedSkills}
                placeholder="Selecciona habilidades reales de tu catalogo"
              />
            </div>
          </Card>

          <Card className="rounded-2xl p-5 shadow-soft">
            <PanelTitle icon={ImageUp} title="Foto de perfil" />
            <div className="mt-5 grid gap-5 md:grid-cols-[1fr_180px]">
              <label className="grid min-h-40 cursor-pointer place-items-center rounded-2xl border border-dashed border-muted-foreground/40 bg-background/50 text-center text-sm text-muted-foreground">
                <input type="file" accept="image/*" className="hidden" onChange={(event) => selectPhoto(event.target.files?.[0] ?? null)} />
                <span><ImageUp className="mx-auto mb-2 h-8 w-8 text-foreground" />Arrastra tu foto aquí<br />o haz clic para seleccionar</span>
              </label>
              <div className="grid place-items-center rounded-2xl bg-muted">
                {visiblePhotoUrl ? <img src={visiblePhotoUrl} alt="Vista previa" className="h-32 w-32 shrink-0 aspect-square rounded-full object-cover" /> : <UserRound className="h-16 w-16 text-muted-foreground" />}
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl p-5 shadow-soft">
            <PanelTitle icon={Globe2} title="Redes sociales" />
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {(["linkedin", "instagram"] as const).map((key) => (
                <Input key={key} value={socialLinks[key]} onChange={(event) => setProfile((prev) => ({ ...prev, social_links: { ...(prev.social_links ?? {}), [key]: event.target.value } }))} placeholder={key === "linkedin" ? "LinkedIn" : "Instagram"} className="h-11 rounded-xl" />
              ))}
            </div>
          </Card>

          <Card className="rounded-2xl p-5 shadow-soft">
            <PanelTitle icon={Star} title="Recomendaciones para mejorar" />
            <div className="mt-5 space-y-3">
              <Suggestion icon={Briefcase} title="Agrega 2 proyectos a tu portafolio" />
              <Suggestion icon={Sparkles} title="Completa tus redes profesionales" />
              <Suggestion icon={Send} title="Publica tu perfil para recibir más solicitudes" />
            </div>
          </Card>
        </div>

        <Card className="flex items-center justify-between rounded-2xl p-5 shadow-soft">
          <p className="text-sm text-muted-foreground">Guarda todos los cambios de tu perfil en una sola acción.</p>
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

function SkillMultiSelect({
  options,
  values,
  onChange,
  placeholder,
}: {
  options: SkillOptionPayload[];
  values: SkillOptionPayload[];
  onChange: (values: SkillOptionPayload[]) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filteredOptions = useMemo(
    () =>
      options.filter(
        (option) =>
          !values.some((value) => value.id === option.id) &&
          `${option.name} ${option.subcategory ?? ""}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [options, query, values],
  );

  const addValue = (option: SkillOptionPayload) => {
    if (values.some((value) => value.id === option.id)) return;
    onChange([...values, option]);
    setQuery("");
    setOpen(false);
  };

  const removeValue = (id: number) => {
    onChange(values.filter((value) => value.id !== id));
  };

  return (
    <div>
      <div className="relative">
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && filteredOptions[0]) {
              event.preventDefault();
              addValue(filteredOptions[0]);
            }
          }}
          placeholder={placeholder}
          className="h-11 rounded-xl pr-10"
        />
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-label="Mostrar habilidades"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-border bg-background py-2 shadow-elegant">
            {(filteredOptions.length ? filteredOptions : []).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => addValue(option)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-secondary/10"
              >
                <span>{option.name}</span>
                <span className="text-xs text-muted-foreground">{option.subcategory ?? option.category}</span>
              </button>
            ))}

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</div>
            ) : null}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            key={value.id}
            className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-white"
          >
            {value.name}
            <button
              type="button"
              onClick={() => removeValue(value.id)}
              className="rounded-full bg-white/20 p-0.5 hover:bg-white/30"
              aria-label={`Quitar ${value.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}


