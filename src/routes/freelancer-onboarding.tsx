import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Award,
  Bell,
  Check,
  ChevronDown,
  CircleCheck,
  GraduationCap,
  Hourglass,
  Lock,
  Sparkles,
  Users,
  Wrench,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { getSessionUser, getToken } from "@/lib/auth";

export const Route = createFileRoute("/freelancer-onboarding")({
  head: () => ({
    meta: [
      { title: "Crear Perfil Freelancer · SkilltoMoney" },
      { name: "description", content: "Completa tu perfil freelancer inicial." },
    ],
  }),
  component: FreelancerOnboarding,
});

const SKILL_OPTIONS = [
  "Edición de videos",
  "Diseño de branding",
  "Automatización con IA",
  "Desarrollo de Landing Page",
  "Diseño UX/UI",
  "Community Management",
  "Copywriting",
  "Fotografía de producto",
  "Desarrollo web",
];

const TOOL_OPTIONS = [
  "Photoshop",
  "InDesign",
  "Figma",
  "Canva Design",
  "Premiere Pro",
  "After Effects",
  "CapCut",
  "Notion",
  "Excel",
];

const AREA_OPTIONS = [
  "Bachiller en Ciencias de la Comunicación",
  "Bachiller en Ciencias de la Computación",
  "Bachiller en Marketing Digital",
  "Bachiller en Arte y Diseño Empresarial",
  "Diseño gráfico",
  "Desarrollo de software",
  "Administración y negocios",
];

const CERTIFICATE_OPTIONS = [
  "Curso de Excel - Nv. Avanzado",
  "Curso de Excel - Nv. Básico",
  "Curso de Excel - Nv. Intermedio",
  "Curso de Macros VBA en Excel",
  "Certificación en UX/UI",
  "Certificación en Marketing Digital",
];

const EXTRA_CERTIFICATE_OPTIONS = [
  "Certificacion en Diseno Grafico",
  "Certificacion en Desarrollo Web",
  "Certificacion en React",
  "Certificacion en JavaScript",
  "Certificacion en Python",
  "Certificacion en Scrum",
  "Certificacion en Productividad Digital",
  "Curso de Photoshop - Nv. Intermedio",
  "Curso de Premiere Pro - Nv. Avanzado",
  "Curso de Figma para UI",
  "Curso de Canva para Negocios",
  "Curso de Community Management",
  "Curso de Copywriting",
  "Curso de Branding Digital",
  "Curso de Analitica Digital",
  "Curso de Inteligencia Artificial Aplicada",
];

function FreelancerOnboarding() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [hasArea, setHasArea] = useState<"si" | "no">("no");
  const [areas, setAreas] = useState<string[]>([]);
  const [certificates, setCertificates] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = skills.length > 0 && tools.length > 0 && description.trim().length >= 20;

  const avatarLabel = useMemo(() => {
    const user = getSessionUser();
    const source = user?.name || user?.email || "YO";

    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, []);

  const continueWithAi = async () => {
    if (!canContinue) return;

    const token = getToken();

    if (!token) {
      setError("Sesion no encontrada. Inicia sesion otra vez.");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      await api.saveProfile(token, {
        experience_area: areas[0] ?? "No especificada",
        bio: description,
        website: website || null,
        social_links: {
          linkedin: linkedin || null,
          instagram: instagram || null,
          website: website || null,
        },
      });

      await api.updateSkills(token, [...skills, ...tools, ...certificates]);
      window.setTimeout(() => navigate({ to: "/dashboard/freelancer" }), 900);
    } catch (err: unknown) {
      const payload = err as { message?: string; errors?: Record<string, string[]> };
      const firstError = Object.values(payload?.errors ?? {})[0]?.[0];

      setError(firstError ?? payload?.message ?? "No se pudo guardar el perfil.");
      setProcessing(false);
    }
  };

  if (processing) {
    return (
      <FreelancerFrame avatarLabel={avatarLabel}>
        <main className="grid min-h-[calc(100vh-57px)] place-items-center px-6">
          <div className="text-center">
            <p className="max-w-xl font-display text-xl font-bold leading-tight">
              Procesando tus datos... Nuestra IA está preparando
              <br />
              tu perfil para armar tu CV ideal
            </p>
            <Hourglass className="mx-auto mt-8 h-10 w-10 animate-pulse text-foreground" />
          </div>
        </main>
      </FreelancerFrame>
    );
  }

  return (
    <FreelancerFrame avatarLabel={avatarLabel}>
      <main className="mx-auto w-full max-w-[1240px] px-5 py-6 lg:px-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Crear Perfil Freelancer</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestiona tu perfil real conectado al backend.
          </p>
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-2">
          <ProfilePanel title="Skills">
            <ChipSelect
              placeholder="Agrega tus habilidades"
              options={SKILL_OPTIONS}
              values={skills}
              onChange={setSkills}
              maxValues={5}
              Icon={Sparkles}
            />
          </ProfilePanel>

          <ProfilePanel title="Descripción personal">
            <div className="relative">
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value.slice(0, 450))}
                placeholder="Cuenta brevemente una descripción sobre ti"
                className="min-h-[168px] resize-none rounded-lg bg-background/40 pr-14"
                maxLength={450}
              />
              <span className="absolute bottom-3 right-3 text-[11px] text-muted-foreground">
                {description.length}/450
              </span>
            </div>
          </ProfilePanel>

          <ProfilePanel title="Herramientas y/o Tecnologías">
            <ChipSelect
              placeholder="Agrega las herramientas que más domines"
              options={TOOL_OPTIONS}
              values={tools}
              onChange={setTools}
              maxValues={5}
              Icon={Wrench}
            />
          </ProfilePanel>

          <ProfilePanel title="Redes Sociales">
            <div className="space-y-4">
              <Input value={linkedin} onChange={(event) => setLinkedin(event.target.value)} placeholder="LinkedIn" />
              <Input value={instagram} onChange={(event) => setInstagram(event.target.value)} placeholder="Instagram" />
              <Input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="Web site" />
            </div>
          </ProfilePanel>

          <Card className="rounded-2xl border-border bg-card p-5 shadow-soft lg:col-span-2">
            <h2 className="font-display text-sm font-bold">Área de desempeño</h2>
            <div className="mt-5 grid gap-8 lg:grid-cols-2">
              <div>
                <div className="flex flex-wrap items-center gap-5 text-xs">
                  <span>¿Cuentas con un área de desempeño?</span>
                  <RadioChoice checked={hasArea === "si"} label="SI" onClick={() => setHasArea("si")} />
                  <RadioChoice
                    checked={hasArea === "no"}
                    label="NO"
                    onClick={() => {
                      setHasArea("no");
                      setAreas([]);
                      setCertificates([]);
                    }}
                  />
                </div>

                <div className="mt-6">
                  <p className="mb-3 text-xs font-semibold">
                    Si tu respuesta fue “SI”, completa lo siguiente:
                  </p>
                  <ChipSelect
                    placeholder="Agrega el nombre del área donde te desempeñas"
                    options={AREA_OPTIONS}
                    values={areas}
                    onChange={setAreas}
                    disabled={hasArea === "no"}
                    maxValues={1}
                    Icon={GraduationCap}
                  />
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold">
                  Si cuentas con certificados, completa lo siguiente:
                </p>
                <ChipSelect
                  placeholder="Agregar certificados"
                  options={[...CERTIFICATE_OPTIONS, ...EXTRA_CERTIFICATE_OPTIONS]}
                  values={certificates}
                  onChange={setCertificates}
                  disabled={hasArea === "no"}
                  maxValues={7}
                  Icon={Award}
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 flex justify-end">
          {error ? <p className="mr-4 self-center text-sm text-red-600">{error}</p> : null}
          <Button
            type="button"
            className="bg-gradient-primary px-6 shadow-soft"
            disabled={!canContinue}
            onClick={continueWithAi}
          >
            Continuar con la IA
          </Button>
        </div>
      </main>
    </FreelancerFrame>
  );
}

function FreelancerFrame({
  avatarLabel,
  children,
}: {
  avatarLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex h-14 items-center justify-between border-b border-border bg-background px-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          Modo Freelancer
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground"
            aria-label="Notificaciones"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
          </button>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground shadow-soft">
            {avatarLabel || "YO"}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

function ProfilePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="min-h-[290px] rounded-2xl border-border bg-card p-5 shadow-soft">
      <h2 className="font-display text-sm font-bold">{title}</h2>
      <div className="mt-5">{children}</div>
    </Card>
  );
}

function RadioChoice({
  checked,
  label,
  onClick,
}: {
  checked: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="flex items-center gap-2" onClick={onClick}>
      <span
        className={cn(
          "grid h-4 w-4 place-items-center rounded-full border",
          checked ? "border-[#00C9BA]" : "border-[#d8bda5]",
        )}
      >
        {checked ? <span className="h-2 w-2 rounded-full bg-[#00C9BA]" /> : null}
      </span>
      {label}
    </button>
  );
}

function ChipSelect({
  placeholder,
  options,
  values,
  onChange,
  disabled = false,
  maxValues,
  Icon,
}: {
  placeholder: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  maxValues?: number;
  Icon: LucideIcon;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const isFull = maxValues !== undefined && values.length >= maxValues;
  const isLocked = disabled || isFull;
  const availableOptions = options.filter(
    (option) => !values.includes(option) && option.toLowerCase().includes(query.toLowerCase()),
  );

  const addValue = (value: string) => {
    if (isLocked || values.includes(value)) return;
    onChange([...values, value]);
    setQuery("");
    setOpen(false);
  };

  const removeValue = (value: string) => {
    onChange(values.filter((item) => item !== value));
  };

  return (
    <div>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          value={query}
          onChange={(event) => {
            if (isLocked) return;
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (!isLocked) setOpen(true);
          }}
          onKeyDown={(event) => {
            if (!isLocked && event.key === "Enter" && availableOptions[0]) {
              event.preventDefault();
              addValue(availableOptions[0]);
            }
          }}
          placeholder={isFull && maxValues ? `Máximo ${maxValues} seleccionados` : placeholder}
          disabled={isLocked}
          className="h-11 rounded-lg pl-9 pr-10"
        />
        <button
          type="button"
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 transition",
            isFull ? "text-[#00C9BA]" : disabled ? "text-muted-foreground" : "text-[#d8a373]",
          )}
          onClick={() => {
            if (!isLocked) setOpen((value) => !value);
          }}
          disabled={isLocked}
          aria-label={
            disabled ? "Selección bloqueada" : isFull ? "Límite alcanzado" : "Mostrar opciones"
          }
        >
          {disabled ? (
            <Lock className="h-5 w-5" />
          ) : isFull ? (
            <CircleCheck className="h-5 w-5" />
          ) : (
            <ChevronDown className={cn("h-5 w-5 transition", open ? "rotate-180" : "")} />
          )}
        </button>

        {open && !isLocked && (
          <div className="absolute z-20 mt-1 max-h-36 w-full overflow-y-auto rounded-md border border-[#cda88d] bg-[#b5e1dc] py-1 text-sm shadow-soft">
            {(availableOptions.length ? availableOptions : ["Sin resultados"]).map((option) => (
              <button
                key={option}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between px-3 py-1.5 text-left text-white transition hover:bg-[#00C9BA]",
                  option === "Sin resultados" && "cursor-default text-white/70 hover:bg-transparent",
                )}
                onClick={() => option !== "Sin resultados" && addValue(option)}
              >
                {option}
                {values.includes(option) ? <Check className="h-3.5 w-3.5" /> : null}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className={cn(
          "mt-6 min-h-24 rounded-lg border border-input bg-background/35 p-3",
          disabled && "bg-muted/60",
          isFull && "border-[#00C9BA]/40",
        )}
      >
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 rounded-full bg-[#00C9BA] px-2.5 py-1 text-xs font-semibold text-white"
            >
              {value}
              <button
                type="button"
                onClick={() => removeValue(value)}
                className="rounded-full bg-white/25 p-0.5 hover:bg-white/40"
                aria-label={`Quitar ${value}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {(disabled || isFull) && (
        <p className="mt-2 text-xs text-muted-foreground">
          {disabled
            ? "Marca SI para habilitar esta selección."
            : `Llegaste al máximo de ${maxValues} selecciones.`}
        </p>
      )}
    </div>
  );
}