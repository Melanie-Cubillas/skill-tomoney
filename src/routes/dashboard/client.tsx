import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Briefcase, CheckCircle2, ClipboardList, Star, Target, Users, Wallet } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, type ProfilePayload } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/client")({
  head: () => ({ meta: [{ title: "Dashboard MYPE · SkilltoMoney" }] }),
  component: ClientRoute,
});

function ClientRoute() {
  const path = useRouterState({ select: (state) => state.location.pathname });

  if (path !== "/dashboard/client") {
    return <Outlet />;
  }

  return <ClientDashboard />;
}

function ClientDashboard() {
  const token = getToken();
  const user = useMemo(() => getSessionUser(), []);
  const [profile, setProfile] = useState<Partial<ProfilePayload>>({});

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        const response = await api.getProfile(token);
        setProfile(response.data ?? {});
      } catch {
        setProfile({});
      }
    };

    void load();
  }, [token]);

  const businessName = profile.business_name || user?.name || "Cafe Lumen";

  return (
    <DashboardShell role="client" profilePhotoUrl={profile.photo_url ?? null}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-normal">¡Hola, {businessName}! 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">Encuentra talento, gestiona tus proyectos y haz crecer tu negocio.</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          <Metric icon={Wallet} label="Presupuesto invertido" value="S/ 4,250.00" hint="+18% vs el mes pasado" tint="teal" />
          <Metric icon={Users} label="Freelancers contratados" value="14" hint="+2 este mes" tint="blue" />
          <Metric icon={Briefcase} label="Proyectos activos" value="5" hint="+1 este mes" tint="amber" />
          <Metric icon={Star} label="Valoracion promedio" value="4.8" hint="Excelente" tint="red" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.5fr_0.7fr_0.75fr]">
          <Card className="rounded-2xl p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold tracking-normal">Inversion y resultados</h2>
              <Button variant="outline" size="sm">Este mes</Button>
            </div>
            <div className="relative h-72">
              <div className="absolute inset-0 grid grid-rows-4 text-xs text-muted-foreground">
                {["S/ 2,000", "S/ 1,500", "S/ 1,000", "S/ 500"].map((label) => (
                  <div key={label} className="border-b border-dashed border-border">
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <svg viewBox="0 0 720 250" className="absolute inset-x-0 bottom-0 h-60 w-full overflow-visible">
                <defs>
                  <linearGradient id="mypeFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#00c9ba" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#00c9ba" stopOpacity="0.03" />
                  </linearGradient>
                </defs>
                <path d="M0 220 L55 195 L110 150 L165 145 L220 112 L275 112 L330 145 L385 112 L440 72 L495 112 L550 82 L605 42 L665 58 L720 22 L720 250 L0 250 Z" fill="url(#mypeFill)" />
                <path d="M0 220 L55 195 L110 150 L165 145 L220 112 L275 112 L330 145 L385 112 L440 72 L495 112 L550 82 L605 42 L665 58 L720 22" fill="none" stroke="#00a99d" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Card>

          <Card className="rounded-2xl p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold tracking-normal">Tu empresa esta lista para contratar</h2>
            <div className="mt-5 flex items-center gap-5">
              <div className="grid h-24 w-24 place-items-center rounded-full border-[8px] border-secondary text-2xl font-extrabold">82%</div>
              <p className="text-sm text-muted-foreground">Tu perfil de empresa esta completo y genera confianza en los freelancers.</p>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              {["Informacion de la empresa", "Descripcion clara", "Logo y portada", "Metodos de pago"].map((item) => (
                <div key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> {item}</div>
              ))}
            </div>
            <Button asChild className="mt-5 rounded-xl bg-gradient-primary shadow-soft">
              <Link to="/dashboard/client/profile">Mejorar perfil</Link>
            </Button>
          </Card>

          <div className="space-y-5">
            <Card className="rounded-2xl border-secondary/30 bg-secondary/10 p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-secondary" />
                <h2 className="font-display text-lg font-bold tracking-normal">Objetivos del mes</h2>
              </div>
              <Goal label="Publicar 2 nuevos proyectos" value="1/2" width="50%" />
              <Goal label="Contratar 2 freelancers" value="2/2" width="100%" />
              <Goal label="Mantener valoracion 4.5+" value="4.8/4.5" width="100%" />
            </Card>
            <Card className="rounded-2xl p-5 shadow-soft">
              <h2 className="font-display text-lg font-bold tracking-normal">Actividad reciente</h2>
              <div className="mt-4 space-y-4 text-sm">
                <Activity icon={ClipboardList} title="Nueva postulacion" detail="Maria G. aplico a Campaña para redes" />
                <Activity icon={Star} title="Propuesta recibida" detail="Juan P. envio una propuesta" />
                <Activity icon={Wallet} title="Pago realizado" detail="S/ 850.00 a Laura M." />
              </div>
            </Card>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <Card className="rounded-2xl p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold tracking-normal">Publicaciones activas</h2>
              <Link to="/dashboard/client/projects" className="text-xs font-semibold text-primary">Ver todas</Link>
            </div>
            <div className="mt-4 space-y-3">
              {[
                ["Campaña para redes", "Marketing y Publicidad", "En evaluacion", "S/ 800.00"],
                ["Diseño de menu", "Diseño Grafico", "En progreso", "S/ 600.00"],
                ["Video promocional", "Edicion de Video", "Publicado", "S/ 1,200.00"],
              ].map(([title, category, status, amount]) => (
                <div key={title} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                  <div>
                    <div className="font-bold">{title}</div>
                    <div className="text-xs text-muted-foreground">{category}</div>
                  </div>
                  <Badge variant="outline" className={status === "Publicado" ? "border-success/40 text-success" : "border-blue-300 text-blue-600"}>{status}</Badge>
                  <div className="text-right text-sm font-bold">{amount}</div>
                </div>
              ))}
            </div>
            <Link to="/dashboard/client/projects" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-secondary">
              Ver todas mis publicaciones <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>

          <Card className="rounded-2xl p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold tracking-normal">Mensajes recientes</h2>
              <Link to="/dashboard/messages" className="text-xs font-semibold text-primary">Ver todos</Link>
            </div>
            <div className="mt-4 space-y-4">
              {["Laura Martinez", "Carlos Sanchez", "Natalia Rojas"].map((name, index) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">{name.slice(0, 2).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold">{name}</div>
                    <div className="truncate text-sm text-muted-foreground">{index === 0 ? "Gracias! Quedo atenta a tus comentarios." : "Te envio mi propuesta para el proyecto."}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">{index === 0 ? "10:30 AM" : "Ayer"}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

function Metric({ icon: Icon, label, value, hint, tint }: { icon: LucideIcon; label: string; value: string; hint: string; tint: "teal" | "blue" | "amber" | "red" }) {
  const colors = {
    teal: "bg-secondary/15 text-secondary",
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
    red: "bg-red-100 text-primary",
  };

  return (
    <Card className="rounded-2xl p-5 shadow-soft">
      <div className="flex items-center gap-4">
        <span className={`grid h-14 w-14 place-items-center rounded-2xl ${colors[tint]}`}>
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-1 font-display text-2xl font-extrabold tracking-normal">{value}</div>
          <div className="mt-1 text-xs font-semibold text-success">{hint}</div>
        </div>
      </div>
    </Card>
  );
}

function Goal({ label, value, width }: { label: string; value: string; width: string }) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-bold text-secondary">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-secondary" style={{ width }} />
      </div>
    </div>
  );
}

function Activity({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary/15 text-secondary">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <div className="font-bold">{title}</div>
        <div className="text-xs text-muted-foreground">{detail}</div>
      </div>
    </div>
  );
}
