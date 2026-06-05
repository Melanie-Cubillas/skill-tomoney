import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  Bell,
  Bot,
  Check,
  ChevronDown,
  CircleCheck,
  GraduationCap,
  Hourglass,
  Lock,
  Rocket,
  Sparkles,
  Sprout,
  Users,
  Wrench,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getSessionUser, getToken } from "@/lib/auth";
import { api, type GeminiAnalysisPayload } from "@/lib/api";

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

type OnboardingStage =
  | "profile"
  | "processing"
  | "project-choice"
  | "project-form"
  | "starter-projects"
  | "availability";

type ProjectDraft = {
  name: string;
  description: string;
  time: string;
};

const EMPTY_PROJECTS: ProjectDraft[] = [
  { name: "", description: "", time: "" },
  { name: "", description: "", time: "" },
  { name: "", description: "", time: "" },
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
  const [stage, setStage] = useState<OnboardingStage>("profile");
  const [projects, setProjects] = useState<ProjectDraft[]>(EMPTY_PROJECTS);
  const [startedProjects, setStartedProjects] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<GeminiAnalysisPayload | null>(null);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const hasRun = useRef(false);
  const [availability, setAvailability] = useState<"si" | "no" | null>(null);
  const [availabilityTime, setAvailabilityTime] = useState("");

  const canContinue = skills.length > 0 && tools.length > 0 && description.trim().length >= 20;
  const selectedSkill = skills[0] ?? "tus habilidades principales";
  const selectedTool = tools[0] ?? "tus herramientas";
  const selectedArea = areas[0] ?? skills[0] ?? "tu carrera";
  const manualProjectsComplete = projects.every(
    (project) =>
      project.name.trim() && project.description.trim().length >= 20 && project.time.trim(),
  );
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
  const suggestedProjects = useMemo(
    () => analysis?.suggested_projects ?? buildSuggestedProjects(selectedSkill, selectedArea),
    [analysis, selectedArea, selectedSkill],
  );

  useEffect(() => {
    if (stage !== "processing" || hasRun.current) return;
    hasRun.current = true;
    setGeminiError(null);
    const token = getToken();

    if (!token) {
      setGeminiError("Sesión no encontrada. Inicia sesión otra vez.");
      setStage("project-choice");
      return;
    }

    api
      .analyzeFreelancer(token, {
        skills,
        tools,
        description,
        linkedin,
        instagram,
        website,
        areas,
        certificates,
      })
      .then((res) => {
        if (res.data) setAnalysis(res.data);
        setStage("project-choice");
      })
      .catch((err) => {
        const payload = err as { message?: string };
        setGeminiError(payload?.message ?? "Error al analizar el perfil.");
        setStage("project-choice");
      });
  }, [stage, skills, tools, description, linkedin, instagram, website, areas, certificates]);

  const continueWithAi = () => {
    if (!canContinue) return;
    setStage("processing");
  };

  const updateProject = (index: number, field: keyof ProjectDraft, value: string) => {
    setProjects((current) =>
      current.map((project, projectIndex) =>
        projectIndex === index ? { ...project, [field]: value } : project,
      ),
    );
  };

  const startSuggestedProject = (projectTitle: string) => {
    setStartedProjects((current) =>
      current.includes(projectTitle) ? current : [...current, projectTitle],
    );
  };

  if (stage === "processing") {
    return (
      <FreelancerFrame avatarLabel={avatarLabel}>
        <main className="grid min-h-[calc(100vh-57px)] place-items-center px-6">
          <div className="text-center">
            <p className="max-w-xl font-display text-xl font-bold leading-tight">
              {geminiError ? "Error al procesar" : "Procesando tus datos con Gemini IA..."}
              <br />
              {geminiError
                ? "Continuando de todos modos."
                : "Analizando habilidades y preparando recomendaciones"}
            </p>
            {geminiError ? (
              <p className="mx-auto mt-4 max-w-md text-sm text-red-500">{geminiError}</p>
            ) : (
              <Hourglass className="mx-auto mt-8 h-10 w-10 animate-pulse text-foreground" />
            )}
          </div>
        </main>
      </FreelancerFrame>
    );
  }

  if (stage === "project-choice") {
    return (
      <FreelancerFrame avatarLabel={avatarLabel}>
        <AiFlowShell progress={35}>
          <StatusPill>Habilidades procesadas exitosamente</StatusPill>
          <AiMessage>
            <strong>Gemini IA:</strong>{" "}
            {analysis
              ? `Ya analicé tu perfil. ${analysis.bio} Basado en esto, te sugiero una tarifa de ${analysis.suggested_rate}.`
              : `Genial. Ya analicé tus habilidades en ${selectedSkill} y herramientas como ${selectedTool}.`}{" "}
            Para armar tu CV ideal y calcular tu tarifa perfecta, cuéntame:
          </AiMessage>

          <section className="mx-auto mt-10 max-w-4xl text-center">
            <h1 className="font-display text-3xl font-bold leading-tight">
              ¿Has realizado proyectos como freelancer o de forma independiente antes?
            </h1>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setStage("project-form")}
                className="min-h-44 rounded-2xl border-2 border-[#00A884] bg-card p-8 text-center shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant"
              >
                <Rocket className="mx-auto h-14 w-14 text-[#00A884]" />
                <p className="mt-6 text-xl font-bold">Sí, he hecho proyectos</p>
              </button>
              <button
                type="button"
                onClick={() => setStage("starter-projects")}
                className="min-h-44 rounded-2xl border-2 border-[#D39B37] bg-card p-8 text-center shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant"
              >
                <Sprout className="mx-auto h-14 w-14 text-[#D39B37]" />
                <p className="mt-6 text-xl font-bold">No, quiero empezar desde cero</p>
              </button>
            </div>
          </section>
        </AiFlowShell>
      </FreelancerFrame>
    );
  }

  if (stage === "project-form") {
    return (
      <FreelancerFrame avatarLabel={avatarLabel}>
        <AiFlowShell progress={45}>
          <AiMessage>
            <strong>SkilltoMoney AI:</strong> Genial, vamos a estructurar tu portafolio. Detalla tus
            3 proyectos más destacados. Ingresa un nombre, una descripción breve y el tiempo total
            que dedicaste a cada uno.
          </AiMessage>

          <section className="mx-auto mt-8 max-w-4xl rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="space-y-6">
              {projects.map((project, index) => (
                <ProjectInputGroup
                  key={index}
                  index={index}
                  project={project}
                  onChange={updateProject}
                />
              ))}
            </div>
          </section>

          <div className="mx-auto mt-8 flex max-w-4xl justify-end">
            <Button
              type="button"
              className="bg-gradient-primary px-6 shadow-soft"
              disabled={!manualProjectsComplete}
              onClick={() => setStage("availability")}
            >
              Continuar al análisis de tiempos y tarifa
            </Button>
          </div>
        </AiFlowShell>
      </FreelancerFrame>
    );
  }

  if (stage === "starter-projects") {
    const allSuggestionsStarted = startedProjects.length >= suggestedProjects.length;

    return (
      <FreelancerFrame avatarLabel={avatarLabel}>
        <AiFlowShell progress={45}>
          <AiMessage>
            <strong>Gemini IA:</strong> No te preocupes. Para ayudarte a construir tu portafolio y
            calcular tu tarifa, te he asignado 3 proyectos prácticos relacionados con{" "}
            <strong>{selectedArea}</strong>. Complétalos para activar tu perfil.
          </AiMessage>

          <section className="mx-auto mt-8 max-w-5xl space-y-5">
            {suggestedProjects.map((project, index) => {
              const started = startedProjects.includes(project.title);

              return (
                <Card
                  key={project.title}
                  className="rounded-2xl border-border bg-card p-5 shadow-soft"
                >
                  <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="flex gap-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-sm font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <h2 className="font-display text-xl font-bold">{project.title}</h2>
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                          {project.description}
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                          <div className="h-2 w-56 max-w-full rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-[#00C9BA] transition-all"
                              style={{ width: started ? "33%" : "0%" }}
                            />
                          </div>
                          <span className="text-sm font-semibold">
                            {started ? "1/3 completados" : "0/3 completados"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      className="bg-[#061013] text-white hover:bg-[#10242a]"
                      onClick={() => startSuggestedProject(project.title)}
                    >
                      {started ? "Proyecto iniciado" : "Empezar proyecto"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </section>

          <div className="mx-auto mt-8 flex max-w-5xl flex-col items-end gap-2">
            <Button
              type="button"
              className="bg-gradient-primary px-6 shadow-soft"
              disabled={!allSuggestionsStarted}
              onClick={() => setStage("availability")}
            >
              Continuar al análisis de tiempos y tarifa
            </Button>
            {!allSuggestionsStarted ? (
              <p className="text-sm text-muted-foreground">Inicia tus proyectos para continuar.</p>
            ) : null}
          </div>
        </AiFlowShell>
      </FreelancerFrame>
    );
  }

  if (stage === "availability") {
    return (
      <FreelancerFrame avatarLabel={avatarLabel}>
        <AiFlowShell progress={62}>
          <AiMessage>
            <strong>SkilltoMoney AI:</strong> Perfecto. Ya tengo la base de tu portafolio. Para
            mostrarte mejor ante clientes, necesito saber tu disponibilidad actual.
          </AiMessage>

          <section className="mx-auto mt-10 max-w-4xl text-center">
            <h1 className="font-display text-3xl font-bold leading-tight">
              ¿Estás disponible para recibir nuevos proyectos?
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Esta respuesta ayudará a priorizar tu perfil cuando una MYPE busque talento.
            </p>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setAvailability("si")}
                className={cn(
                  "min-h-40 rounded-2xl border-2 bg-card p-8 text-center shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant",
                  availability === "si" ? "border-[#00C9BA]" : "border-border",
                )}
              >
                <CircleCheck className="mx-auto h-12 w-12 text-[#00C9BA]" />
                <p className="mt-5 text-xl font-bold">Sí, estoy disponible</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Puedo recibir propuestas y responder a clientes.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAvailability("no")}
                className={cn(
                  "min-h-40 rounded-2xl border-2 bg-card p-8 text-center shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant",
                  availability === "no" ? "border-[#D39B37]" : "border-border",
                )}
              >
                <Lock className="mx-auto h-12 w-12 text-[#D39B37]" />
                <p className="mt-5 text-xl font-bold">No por ahora</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Mantendré mi perfil en preparación hasta estar listo.
                </p>
              </button>
            </div>

            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-border bg-card p-5 text-left shadow-soft">
              <label htmlFor="availability-time" className="text-sm font-bold">
                ¿Cuánto tiempo puedes invertir en proyectos?
              </label>
              <p className="mt-1 text-xs text-muted-foreground">
                Coloca tu disponibilidad estimada, por ejemplo: 10 horas por semana, fines de semana
                o 2 horas al día.
              </p>
              <Input
                id="availability-time"
                value={availabilityTime}
                onChange={(event) => setAvailabilityTime(event.target.value)}
                placeholder="Ej. 10 horas por semana"
                className="mt-4"
              />
            </div>
          </section>

          <div className="mx-auto mt-8 flex max-w-4xl justify-end">
            <Button
              type="button"
              className="bg-gradient-primary px-6 shadow-soft"
              disabled={!availability || !availabilityTime.trim()}
              onClick={() => navigate({ to: "/dashboard/freelancer" })}
            >
              Finalizar perfil
            </Button>
          </div>
        </AiFlowShell>
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
              <Input
                value={linkedin}
                onChange={(event) => setLinkedin(event.target.value)}
                placeholder="LinkedIn"
              />
              <Input
                value={instagram}
                onChange={(event) => setInstagram(event.target.value)}
                placeholder="Instagram"
              />
              <Input
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                placeholder="Web site"
              />
            </div>
          </ProfilePanel>

          <Card className="rounded-2xl border-border bg-card p-5 shadow-soft lg:col-span-2">
            <h2 className="font-display text-sm font-bold">Área de desempeño</h2>
            <div className="mt-5 grid gap-8 lg:grid-cols-2">
              <div>
                <div className="flex flex-wrap items-center gap-5 text-xs">
                  <span>¿Cuentas con un área de desempeño?</span>
                  <RadioChoice
                    checked={hasArea === "si"}
                    label="SI"
                    onClick={() => setHasArea("si")}
                  />
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

function AiFlowShell({ children, progress }: { children: React.ReactNode; progress: number }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-5 lg:px-8">
      <div className="h-3 overflow-hidden rounded-full border border-border bg-card">
        <div
          className="h-full rounded-full bg-[#2f343a] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="py-10">{children}</div>
    </main>
  );
}

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-sm font-bold shadow-soft">
      <CircleCheck className="h-5 w-5 text-muted-foreground" />
      {children}
    </div>
  );
}

function AiMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-4xl items-center gap-5">
      <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border border-[#9fcfc8] bg-[#dff7f4] text-[#061013] shadow-soft">
        <Bot className="h-11 w-11" />
      </div>
      <div className="rounded-2xl border border-border bg-card px-6 py-5 text-lg leading-snug shadow-soft">
        {children}
      </div>
    </div>
  );
}

function ProjectInputGroup({
  index,
  project,
  onChange,
}: {
  index: number;
  project: ProjectDraft;
  onChange: (index: number, field: keyof ProjectDraft, value: string) => void;
}) {
  return (
    <div className="relative pl-10">
      <span className="absolute left-0 top-1 grid h-8 w-8 place-items-center rounded-full bg-[#061013] text-sm font-bold text-white">
        {index + 1}
      </span>
      <h2 className="font-display text-xl font-bold">Proyecto {index + 1}</h2>
      <div className="mt-3 space-y-3">
        <Input
          value={project.name}
          onChange={(event) => onChange(index, "name", event.target.value)}
          placeholder="Nombre del proyecto"
        />
        <div className="relative">
          <Input
            value={project.description}
            onChange={(event) => onChange(index, "description", event.target.value.slice(0, 120))}
            placeholder="Descripción breve"
            maxLength={120}
            className="pr-16"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
            {project.description.length}/120
          </span>
        </div>
        <Input
          value={project.time}
          onChange={(event) => onChange(index, "time", event.target.value)}
          placeholder="Tiempo invertido (ej. 15 horas)"
        />
      </div>
    </div>
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

function buildSuggestedProjects(skill: string, area: string) {
  const normalized = `${skill} ${area}`.toLowerCase();

  if (normalized.includes("video")) {
    return [
      {
        title: "Edición de video promocional para start-up",
        description: "Crea un video corto para redes con guion, cortes limpios y subtítulos.",
      },
      {
        title: "Reel de lanzamiento para marca local",
        description: "Diseña una pieza vertical de 30 segundos para presentar un producto.",
      },
      {
        title: "Demo visual de servicio digital",
        description: "Arma un video explicativo breve mostrando problema, solución y beneficios.",
      },
    ];
  }

  if (normalized.includes("dise") || normalized.includes("branding") || normalized.includes("ux")) {
    return [
      {
        title: "Diseño de logotipo para café local",
        description: "Crea un logo, paleta de color y una breve justificación visual.",
      },
      {
        title: "Rediseño de portada para red social",
        description: "Diseña una portada profesional alineada a una marca pequeña.",
      },
      {
        title: "Landing visual para servicio digital",
        description: "Propón una estructura visual con secciones, jerarquía y llamada a la acción.",
      },
    ];
  }

  if (normalized.includes("web") || normalized.includes("computaci")) {
    return [
      {
        title: "Creación de página de aterrizaje para e-commerce",
        description: "Construye una landing simple con secciones, beneficios y botón principal.",
      },
      {
        title: "Formulario de contacto para negocio local",
        description: "Diseña una interfaz clara para capturar datos de clientes potenciales.",
      },
      {
        title: "Panel básico de servicios",
        description: "Crea una vista ordenada para listar servicios, precios y estados.",
      },
    ];
  }

  return [
    {
      title: "Proyecto práctico para negocio local",
      description: "Resuelve una necesidad digital pequeña usando tus habilidades principales.",
    },
    {
      title: "Caso de mejora para marca personal",
      description: "Propón una mejora concreta y documenta el antes, proceso y resultado.",
    },
    {
      title: "Entrega profesional para portafolio",
      description: "Crea una pieza final presentable con objetivo, solución y tiempo invertido.",
    },
  ];
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
          <div className="absolute z-20 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-[#00C9BA]/45 bg-white py-1.5 text-sm shadow-elegant">
            {(availableOptions.length ? availableOptions : ["Sin resultados"]).map((option) => (
              <button
                key={option}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-left font-semibold text-foreground transition hover:bg-[#00C9BA]/14 hover:text-[#061013]",
                  option === "Sin resultados" &&
                    "cursor-default text-muted-foreground hover:bg-transparent hover:text-muted-foreground",
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
