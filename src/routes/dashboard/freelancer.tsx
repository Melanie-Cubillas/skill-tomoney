import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Briefcase, CheckCircle2, ClipboardCheck, Send, Star, Wallet } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, type ProfilePayload } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/freelancer")({
  head: () => ({ meta: [{ title: "Dashboard Freelancer · SkilltoMoney" }] }),
  component: FreelancerRoute,
});

function FreelancerRoute() {
  const path = useRouterState({ select: (state) => state.location.pathname });

  if (path !== "/dashboard/freelancer") {
    return <Outlet />;
  }

  return <FreelancerDashboard />;
}

function FreelancerDashboard() {
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

  const firstName = (user?.name ?? "Andrea").split(" ")[0] || "Andrea";

  return (
    <DashboardShell role="freelancer" profilePhotoUrl={profile.photo_url ?? null}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-normal">¡Hola, {firstName}! 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">Este es tu resumen profesional. Sigue asi, vas por buen camino.</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          <Metric icon={Wallet} label="Ganancias totales" value="S/ 3,250.00" hint="+12% vs el mes pasado" tint="teal" />
          <Metric icon={ClipboardCheck} label="Proyectos completados" value={`${profile.completed_jobs ?? 18}`} hint="+3 este mes" tint="blue" />
          <Metric icon={Star} label="Valoracion promedio" value={`${profile.rating ?? "4.8"}`} hint="Excelente" tint="amber" />
          <Metric icon={Send} label="Propuestas enviadas" value="26" hint="+6 esta semana" tint="red" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.7fr_0.85fr_0.85fr]">
          <Card className="rounded-2xl p-6 shadow-soft">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold tracking-normal">Ganancias en los ultimos 30 dias</h2>
              <Button variant="outline" size="sm">Este mes</Button>
            </div>
            <div className="relative h-72">
              <div className="absolute inset-0 grid grid-rows-4 text-xs text-muted-foreground">
                {["S/ 1,000", "S/ 750", "S/ 500", "S/ 250"].map((label) => (
                  <div key={label} className="border-b border-dashed border-border">
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <svg viewBox="0 0 720 250" className="absolute inset-x-0 bottom-0 h-60 w-full overflow-visible">
                <defs>
                  <linearGradient id="earningsFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#00c9ba" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#00c9ba" stopOpacity="0.03" />
                  </linearGradient>
                </defs>
                <path d="M0 230 L55 210 L110 120 L165 82 L220 135 L275 112 L330 102 L385 45 L440 130 L495 90 L550 82 L605 24 L665 42 L720 5 L720 250 L0 250 Z" fill="url(#earningsFill)" />
                <path d="M0 230 L55 210 L110 120 L165 82 L220 135 L275 112 L330 102 L385 45 L440 130 L495 90 L550 82 L605 24 L665 42 L720 5" fill="none" stroke="#00a99d" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                {[0, 55, 110, 165, 220, 275, 330, 385, 440, 495, 550, 605, 665, 720].map((x, index) => (
                  <circle key={x} cx={x} cy={[230, 210, 120, 82, 135, 112, 102, 45, 130, 90, 82, 24, 42, 5][index]} r="5" fill="#00a99d" stroke="#fff" strokeWidth="3" />
                ))}
              </svg>
            </div>
          </Card>

          <Card className="rounded-2xl p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold tracking-normal">Tu perfil esta completo</h2>
            <div className="mt-5 flex items-center gap-5">
              <div className="grid h-24 w-24 shrink-0 aspect-square place-items-center rounded-full border-[8px] border-secondary text-2xl font-extrabold">78%</div>
              <p className="text-sm text-muted-foreground">Un perfil completo te ayuda a conseguir mas proyectos.</p>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              {["Foto de perfil", "Descripcion personal", "Habilidades añadidas", "Portafolio agregado"].map((item) => (
                <div key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> {item}</div>
              ))}
            </div>
            <Button asChild className="mt-5 rounded-xl bg-gradient-primary shadow-soft">
              <Link to="/dashboard/freelancer/profile">Mejorar perfil</Link>
            </Button>
          </Card>

          <div className="space-y-5">
            <Card className="rounded-2xl border-secondary/30 bg-secondary/10 p-5 shadow-soft">
              <h2 className="font-display text-lg font-bold tracking-normal">Consejo para hoy ✨</h2>
              <p className="mt-3 text-sm text-muted-foreground">Los perfiles con portafolio reciben 3x mas visitas de clientes potenciales.</p>
              <Link to="/dashboard/freelancer/portfolio" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-secondary">
                Ver recomendaciones <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
            <Card className="rounded-2xl p-5 shadow-soft">
              <h2 className="font-display text-lg font-bold tracking-normal">Actividad reciente</h2>
              <div className="mt-4 space-y-4 text-sm">
                <Activity icon={Wallet} title="Pago recibido" detail="S/ 250.00 de Laura Martinez" />
                <Activity icon={Star} title="Nueva valoracion" detail="5 estrellas de NutriVida" />
                <Activity icon={Briefcase} title="Propuesta aceptada" detail="Edicion de video promocional" />
              </div>
            </Card>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <Card className="rounded-2xl p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold tracking-normal">Proyectos activos</h2>
              <Link to="/dashboard/freelancer/portfolio" className="text-xs font-semibold text-primary">Ver todos</Link>
            </div>
            <div className="mt-4 space-y-3">
              {[
                ["Diseño de logo para marca", "Laura Martinez", "En progreso", "S/ 250.00"],
                ["Edicion de video promocional", "NutriVida", "En progreso", "S/ 450.00"],
                ["Banners para redes sociales", "Beauty Care", "Pendiente", "S/ 150.00"],
              ].map(([title, client, status, amount]) => (
                <div key={title} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                  <div>
                    <div className="font-bold">{title}</div>
                    <div className="text-xs text-muted-foreground">{client}</div>
                  </div>
                  <Badge variant="outline" className={status === "Pendiente" ? "border-warning/40 text-orange-600" : "border-blue-300 text-blue-600"}>{status}</Badge>
                  <div className="text-right text-sm font-bold">{amount}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-2xl p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold tracking-normal">Mensajes recientes</h2>
              <Link to="/dashboard/messages" className="text-xs font-semibold text-primary">Ver todos</Link>
            </div>
            <div className="mt-4 space-y-4">
              {["Laura Martinez", "NutriVida", "Carlos Sanchez"].map((name, index) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 aspect-square place-items-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">{name.slice(0, 2).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold">{name}</div>
                    <div className="truncate text-sm text-muted-foreground">{index === 0 ? "Hola Andrea! Me encanto el diseño..." : "Listo, muchas gracias!"}</div>
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
