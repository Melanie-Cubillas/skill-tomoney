import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Wallet, Eye, Star, ArrowUpRight, Zap } from "lucide-react";

export const Route = createFileRoute("/dashboard/freelancer")({
  head: () => ({ meta: [{ title: "Dashboard Freelancer · SkilltoMoney" }] }),
  component: () => (
    <DashboardShell role="freelancer">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hola, Camila 👋</div>
          <h1 className="mt-1 font-display text-3xl font-bold">Tu negocio digital</h1>
        </div>
        <Button asChild className="bg-gradient-primary shadow-soft"><Link to="/dashboard/freelancer/services">+ Nuevo servicio</Link></Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Ingresos del mes", v: "S/ 1,240", d: "+18%", i: Wallet },
          { l: "Visitas al perfil", v: "842", d: "+24%", i: Eye },
          { l: "Rating", v: "4.9", d: "+0.1", i: Star },
          { l: "Proyectos activos", v: "5", d: "+2", i: TrendingUp },
        ].map(s=>(
          <Card key={s.l} className="p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground"><s.i className="h-4 w-4" /></div>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div className="font-display text-3xl font-bold">{s.v}</div>
              <span className="flex items-center gap-0.5 text-xs font-semibold text-success"><ArrowUpRight className="h-3 w-3" /> {s.d}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Pedidos recientes</h2>
            <Button variant="ghost" size="sm">Ver todos</Button>
          </div>
          <div className="mt-4 divide-y divide-border">
            {[
              { t: "Logo Café Lúmen", c: "Lúmen Café", s: "En progreso", p: "S/ 120" },
              { t: "Reels Boutique Aria", c: "Aria", s: "Entregado", p: "S/ 220" },
              { t: "Plan IG Yoga Flow", c: "Yoga Flow", s: "Revisión", p: "S/ 350" },
              { t: "Identidad Sushi Roll", c: "Sushi Roll", s: "Nuevo", p: "S/ 480" },
            ].map(o=>(
              <div key={o.t} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">{o.t}</div>
                  <div className="text-xs text-muted-foreground">{o.c}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">{o.s}</Badge>
                  <div className="font-display font-semibold">{o.p}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="relative overflow-hidden border-primary/20 bg-gradient-hero p-6 text-primary-foreground shadow-glow">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs"><Sparkles className="h-3.5 w-3.5 text-primary-glow" /> IA Assistant</div>
            <h3 className="mt-2 font-display text-lg font-bold">Tip de hoy</h3>
            <p className="mt-2 text-sm text-white/80">Subir tus precios un 15% no debería afectar tu match: estás 18% por debajo del promedio de tu categoría.</p>
            <div className="mt-4 space-y-2">
              <div className="rounded-xl bg-white/10 p-3 text-xs backdrop-blur">
                ⚡ Publica un servicio de "Identidad de marca" — alta demanda esta semana.
              </div>
              <div className="rounded-xl bg-white/10 p-3 text-xs backdrop-blur">
                📸 Agrega 2 proyectos a tu portafolio para subir 25% tu visibilidad.
              </div>
            </div>
            <Button size="sm" className="mt-5 w-full bg-white/15 text-primary-foreground backdrop-blur hover:bg-white/25"><Zap className="mr-1 h-3.5 w-3.5" /> Aplicar sugerencia</Button>
          </div>
        </Card>
      </div>
    </DashboardShell>
  ),
});
