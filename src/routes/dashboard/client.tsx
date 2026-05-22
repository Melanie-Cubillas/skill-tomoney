import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { freelancers } from "@/data/mock";
import { Sparkles, Star, ArrowRight, Wallet, FolderKanban, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/dashboard/client")({
  head: () => ({ meta: [{ title: "Dashboard Cliente · SkilltoMoney" }] }),
  component: () => (
    <DashboardShell role="client">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hola, Lúmen Café 👋</div>
          <h1 className="mt-1 font-display text-3xl font-bold">Tu próximo proyecto digital</h1>
        </div>
        <Button asChild className="bg-gradient-primary shadow-soft"><Link to="/talent">+ Publicar proyecto</Link></Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { l: "Proyectos activos", v: "3", i: FolderKanban },
          { l: "En escrow", v: "S/ 480", i: Wallet },
          { l: "Mensajes sin leer", v: "5", i: MessageSquare },
        ].map(s=>(
          <Card key={s.l} className="p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground"><s.i className="h-4 w-4" /></div>
            </div>
            <div className="mt-2 font-display text-3xl font-bold">{s.v}</div>
          </Card>
        ))}
      </div>

      <Card className="relative mt-6 overflow-hidden border-primary/20 bg-gradient-hero p-6 text-primary-foreground shadow-glow">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs"><Sparkles className="h-3.5 w-3.5 text-primary-glow" /> Match IA</div>
            <h3 className="mt-1 font-display text-2xl font-bold">Tenemos 3 freelancers ideales para tu cafetería</h3>
            <p className="mt-2 text-sm text-white/75">Basado en tu última búsqueda: "branding y reels para café".</p>
          </div>
          <Button className="bg-white/15 text-primary-foreground backdrop-blur hover:bg-white/25" asChild><Link to="/talent">Ver matches <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
        </div>
      </Card>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recomendados para ti</h2>
          <Button variant="ghost" size="sm" asChild><Link to="/talent">Ver todos</Link></Button>
        </div>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {freelancers.slice(0,3).map(f=>(
            <Card key={f.id} className="p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-primary font-bold text-primary-foreground">{f.avatar}</div>
                <div>
                  <div className="font-display font-semibold">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{f.role}</div>
                </div>
                <Badge variant="outline" className="ml-auto border-primary/30 text-primary">{f.match}%</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-warning"><Star className="h-3.5 w-3.5 fill-current" /> <span className="font-semibold text-foreground">{f.rating}</span></div>
                <div className="font-display font-bold">S/ {f.price}/h</div>
              </div>
              <Button className="mt-4 w-full bg-gradient-primary shadow-soft" size="sm">Invitar a proyecto</Button>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  ),
});
