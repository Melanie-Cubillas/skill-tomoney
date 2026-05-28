import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api, type ProfilePayload, type RecommendationPayload } from "@/lib/api";
import { getToken } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/freelancer")({
  head: () => ({ meta: [{ title: "Dashboard Freelancer · SkilltoMoney" }] }),
  component: FreelancerDashboard,
});

function FreelancerDashboard() {
  const token = getToken();
  const [profile, setProfile] = useState<Partial<ProfilePayload>>({});
  const [skillsText, setSkillsText] = useState("");
  const [recommendations, setRecommendations] = useState<RecommendationPayload[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        const profileResponse = await api.getProfile(token);
        if (profileResponse.data) {
          setProfile(profileResponse.data);
          setSkillsText((profileResponse.data.skills ?? []).join(", "));
        }

        const recResponse = await api.getRecommendations(token, "profile_improvement");
        setRecommendations(recResponse.data ?? []);
      } catch {
        setError("No se pudo cargar la informacion del perfil.");
      }
    };

    void load();
  }, [token]);

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

  const requireToken = (): string | null => {
    if (!token) {
      setError("Sesion no encontrada. Inicia sesion otra vez.");
      return null;
    }
    return token;
  };

  const saveBaseProfile = async () => {
    const t = requireToken();
    if (!t) return;
    setError(null);
    setMessage(null);
    try {
      const response = await api.saveProfile(t, {
        headline: profile.headline ?? null,
        category: profile.category ?? null,
        bio: profile.bio ?? null,
        location: profile.location ?? null,
        hourly_rate: profile.hourly_rate ?? null,
      });
      setProfile(response.data ?? {});
      setMessage("Perfil actualizado.");
    } catch {
      setError("No se pudo actualizar el perfil.");
    }
  };

  const saveDescription = async () => {
    const t = requireToken();
    if (!t) return;
    setError(null);
    setMessage(null);
    try {
      await api.updateDescription(t, profile.description ?? "");
      setMessage("Descripcion actualizada.");
    } catch {
      setError("No se pudo actualizar la descripcion.");
    }
  };

  const saveSkills = async () => {
    const t = requireToken();
    if (!t) return;
    setError(null);
    setMessage(null);
    const skills = skillsText
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    try {
      await api.updateSkills(t, skills);
      setMessage("Habilidades actualizadas.");
    } catch {
      setError("No se pudieron guardar las habilidades.");
    }
  };

  const saveSocial = async () => {
    const t = requireToken();
    if (!t) return;
    setError(null);
    setMessage(null);
    try {
      await api.updateSocialLinks(t, {
        linkedin: socialLinks.linkedin || null,
        instagram: socialLinks.instagram || null,
        facebook: socialLinks.facebook || null,
        x: socialLinks.x || null,
        website: socialLinks.website || null,
      });
      setMessage("Redes sociales actualizadas.");
    } catch {
      setError("No se pudieron actualizar las redes.");
    }
  };

  const savePhoto = async (file: File | null) => {
    const t = requireToken();
    if (!t || !file) return;
    setError(null);
    setMessage(null);
    try {
      const response = await api.updatePhoto(t, file);
      if (response.data) setProfile(response.data);
      setMessage("Foto actualizada.");
    } catch {
      setError("No se pudo subir la foto.");
    }
  };

  return (
    <DashboardShell role="freelancer">
      <div>
        <h1 className="font-display text-3xl font-bold">Perfil freelancer</h1>
        <p className="text-muted-foreground">Gestiona tu perfil real conectado al backend.</p>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-emerald-600">{message}</p> : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">Datos base</h2>
          <Input placeholder="Titulo profesional" value={profile.headline ?? ""} onChange={(e) => setProfile((prev) => ({ ...prev, headline: e.target.value }))} />
          <Input placeholder="Categoria" value={profile.category ?? ""} onChange={(e) => setProfile((prev) => ({ ...prev, category: e.target.value }))} />
          <Input placeholder="Ubicacion" value={profile.location ?? ""} onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))} />
          <Input placeholder="Tarifa por hora" value={profile.hourly_rate ?? ""} onChange={(e) => setProfile((prev) => ({ ...prev, hourly_rate: e.target.value }))} />
          <Button onClick={saveBaseProfile}>Guardar perfil</Button>
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">Descripcion personal</h2>
          <Textarea placeholder="Cuenta brevemente tu propuesta de valor" value={profile.description ?? ""} onChange={(e) => setProfile((prev) => ({ ...prev, description: e.target.value }))} />
          <Button onClick={saveDescription}>Guardar descripcion</Button>
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">Habilidades</h2>
          <Input placeholder="React, Branding, Copywriting" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} />
          <Button onClick={saveSkills}>Guardar habilidades</Button>
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">Foto de perfil</h2>
          <Input type="file" accept="image/*" onChange={(e) => savePhoto(e.target.files?.[0] ?? null)} />
          {profile.photo_url ? <a href={profile.photo_url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Ver foto actual</a> : null}
        </Card>

        <Card className="space-y-3 p-5 lg:col-span-2">
          <h2 className="font-semibold">Redes sociales</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="LinkedIn" value={socialLinks.linkedin} onChange={(e) => setProfile((prev) => ({ ...prev, social_links: { ...(prev.social_links ?? {}), linkedin: e.target.value } }))} />
            <Input placeholder="Instagram" value={socialLinks.instagram} onChange={(e) => setProfile((prev) => ({ ...prev, social_links: { ...(prev.social_links ?? {}), instagram: e.target.value } }))} />
            <Input placeholder="Facebook" value={socialLinks.facebook} onChange={(e) => setProfile((prev) => ({ ...prev, social_links: { ...(prev.social_links ?? {}), facebook: e.target.value } }))} />
            <Input placeholder="X/Twitter" value={socialLinks.x} onChange={(e) => setProfile((prev) => ({ ...prev, social_links: { ...(prev.social_links ?? {}), x: e.target.value } }))} />
            <Input placeholder="Website" value={socialLinks.website} onChange={(e) => setProfile((prev) => ({ ...prev, social_links: { ...(prev.social_links ?? {}), website: e.target.value } }))} />
          </div>
          <Button onClick={saveSocial}>Guardar redes</Button>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="font-semibold">Recomendaciones de mejora</h2>
          <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">
            {(recommendations.length ? recommendations : [{ id: 0, title: "Sin recomendaciones", description: "Aun no hay recomendaciones para tu cuenta." }]).map((rec) => (
              <li key={rec.id} className="mb-1">
                <span className="font-medium text-foreground">{rec.title}:</span> {rec.description}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </DashboardShell>
  );
}
