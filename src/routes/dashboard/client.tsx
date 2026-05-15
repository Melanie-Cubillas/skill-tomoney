import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Search, Briefcase, Star, MessageSquare } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { freelancers } from "@/data/mock";

export const Route = createFileRoute("/dashboard/client")({
  head: () => ({ meta: [{ title: "Dashboard MYPE · SkilltoMoney" }] }),
  component: () => (
    <DashboardShell role="client">
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div><h1 className="font-display text-3xl font-bold">Hola, Cafetería Lúmen ☕</h1><p className="mt-1 text-muted-foreground">Encuentra el talento ideal para tu próximo proyecto.</p></div>
        <Button asChild className="bg-gradient-primary"><Link to="/talent"><Search className="mr-1 h-4 w-4" /> Buscar talento</Link></Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[{l:"Proyectos activos",v:"3",i:Briefcase},{l:"Mensajes",v:"5",i:MessageSquare},{l:"Freelancers favoritos",v:"12",i:Star}].map(s=>(
          <Card key={s.l} className="p-5"><div className="flex items-center justify-between"><div className="text-sm text-muted-foreground">{s.l}</div><s.i className="h-4 w-4 text-primary" /></div><div className="mt-2 text-2xl font-bold">{s.v}</div></Card>
        ))}
      </div>

      <Card className="mt-8 p-6">
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-accent/60 p-3 text-sm"><Sparkles className="h-4 w-4 text-primary" /><b>Freelancers recomendados para ti</b> · según tu última búsqueda</div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {freelancers.slice(0,3).map(f=>(
            <Card key={f.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-primary font-semibold text-primary-foreground">{f.avatar}</div><div><div className="font-semibold">{f.name}</div><div className="text-xs text-muted-foreground">{f.role}</div></div></div>
                <Badge className="bg-success/15 text-success">{f.match}%</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-1"><div className="text-xs text-muted-foreground">{f.skills.join(" · ")}</div></div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3"><span className="text-sm font-semibold text-gradient">S/ {f.price}/h</span><Button size="sm" variant="outline">Ver perfil</Button></div>
            </Card>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 font-display font-semibold">Proyectos activos</h3>
          <div className="space-y-3">
            {[{t:"Branding cafetería",f:"Camila Rojas",s:"En progreso"},{t:"Edición de 10 reels",f:"Diego Salazar",s:"Esperando entrega"},{t:"Landing menú online",f:"Mateo Quispe",s:"Revisión"}].map(p=>(
              <div key={p.t} className="flex items-center justify-between rounded-xl border border-border p-4">
                <div><div className="font-medium">{p.t}</div><div className="text-xs text-muted-foreground">{p.f}</div></div>
                <Badge variant="secondary" className="bg-accent text-accent-foreground">{p.s}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="mb-4 font-display font-semibold">Mensajes</h3>
          <div className="space-y-2">
            {freelancers.slice(0,3).map(f=>(
              <Link key={f.id} to="/dashboard/messages" className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted/60">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">{f.avatar}</div>
                <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{f.name}</div><div className="truncate text-xs text-muted-foreground">Te paso la propuesta hoy 🚀</div></div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </DashboardShell>
  ),
});
