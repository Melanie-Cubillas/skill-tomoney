import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, TrendingUp, Eye, MessageSquare, Wallet, Plus, Star, ArrowRight, Lightbulb } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/freelancer")({
  head: () => ({ meta: [{ title: "Dashboard Freelancer · SkilltoMoney" }] }),
  component: FreelancerDashboard,
});

const stats = [
  { label: "Visitas al perfil", value: "1,284", delta: "+12%", icon: Eye },
  { label: "Mensajes nuevos", value: "8", delta: "+3", icon: MessageSquare },
  { label: "Ventas del mes", value: "S/ 1,420", delta: "+24%", icon: Wallet },
  { label: "Visibilidad", value: "75%", delta: "Buena", icon: TrendingUp },
];

function FreelancerDashboard() {
  return (
    <DashboardShell role="freelancer">
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold">Hola, Camila 👋</h1>
          <p className="mt-1 text-muted-foreground">Aquí está el resumen de tu actividad esta semana.</p>
        </div>
        <Button asChild className="bg-gradient-primary"><Link to="/dashboard/freelancer/services"><Plus className="mr-1 h-4 w-4" /> Publicar servicio</Link></Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s=>(
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between"><div className="text-sm text-muted-foreground">{s.label}</div><s.icon className="h-4 w-4 text-primary" /></div>
            <div className="mt-2 text-2xl font-bold">{s.value}</div>
            <div className="mt-1 text-xs text-success">{s.delta}</div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-display text-lg font-semibold">Mi perfil público</h3>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-primary text-2xl font-bold text-primary-foreground shadow-soft">CR</div>
            <div className="flex-1 min-w-[200px]">
              <div className="text-xl font-semibold">Camila Rojas</div>
              <div className="text-sm text-muted-foreground">Diseñadora gráfica · Branding e identidad</div>
              <div className="mt-2 flex items-center gap-1 text-warning text-sm"><Star className="h-4 w-4 fill-current" /><span className="text-foreground font-medium">4.9</span> <span className="text-muted-foreground">(38 reseñas)</span></div>
            </div>
            <Button variant="outline">Editar perfil</Button>
          </div>
          <div className="mt-5">
            <div className="text-xs uppercase text-muted-foreground">Habilidades</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Branding","Logos","Social Media","Adobe Illustrator","Figma"].map(s=>(<Badge key={s} variant="secondary" className="bg-accent text-accent-foreground">{s}</Badge>))}
            </div>
          </div>
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm"><span className="font-medium">Completitud del perfil</span><span className="text-muted-foreground">75%</span></div>
            <div className="h-2 w-full rounded-full bg-muted"><div className="h-2 w-3/4 rounded-full bg-gradient-primary" /></div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-primary" /> IA Assistant</div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl bg-muted/60 p-3"><Lightbulb className="mb-1 inline h-4 w-4 text-primary" /> Tu perfil puede mejorar agregando más proyectos.</div>
            <div className="rounded-xl bg-accent p-3 text-accent-foreground">📈 “Edición TikTok” tiene alta demanda esta semana.</div>
            <div className="rounded-xl border border-border p-3"><div className="text-xs text-muted-foreground">Precio recomendado</div><div className="text-lg font-bold text-gradient">S/ 80 — S/ 120</div></div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between"><h3 className="font-display font-semibold">Servicios activos</h3><Link to="/dashboard/freelancer/services" className="text-sm text-primary">Ver todos <ArrowRight className="ml-1 inline h-3 w-3" /></Link></div>
          <div className="space-y-3">
            {[{t:"Logo + manual de marca",p:120},{t:"Posts mensuales para Instagram",p:280}].map(s=>(
              <div key={s.t} className="flex items-center justify-between rounded-xl border border-border p-4">
                <div><div className="font-medium">{s.t}</div><div className="text-xs text-muted-foreground">3 días · 12 ventas</div></div>
                <div className="font-bold text-gradient">S/ {s.p}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between"><h3 className="font-display font-semibold">Mensajes recientes</h3><Link to="/dashboard/messages" className="text-sm text-primary">Abrir chat</Link></div>
          <div className="space-y-2">
            {[{n:"Ricardo · Cafetería Lúmen",m:"Listo, vamos con la propuesta 2."},{n:"Andrea · Boutique Sol",m:"¿Cuánto sería el rediseño?"}].map(m=>(
              <div key={m.n} className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted/60">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">{m.n[0]}</div>
                <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{m.n}</div><div className="truncate text-xs text-muted-foreground">{m.m}</div></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
