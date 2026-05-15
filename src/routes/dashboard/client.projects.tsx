import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/client/projects")({
  head: () => ({ meta: [{ title: "Mis proyectos · SkilltoMoney" }] }),
  component: () => (
    <DashboardShell role="client">
      <h1 className="font-display text-3xl font-bold">Mis proyectos</h1>
      <p className="text-muted-foreground">Sigue el avance de cada contratación.</p>
      <div className="mt-6 space-y-4">
        {[
          {t:"Branding cafetería",f:"Camila Rojas",p:60,s:"En progreso"},
          {t:"Edición de 10 reels",f:"Diego Salazar",p:30,s:"Esperando entrega"},
          {t:"Landing menú online",f:"Mateo Quispe",p:90,s:"Revisión"},
        ].map(p=>(
          <Card key={p.t} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><div className="font-semibold">{p.t}</div><div className="text-xs text-muted-foreground">Freelancer: {p.f}</div></div>
              <Badge className="bg-accent text-accent-foreground">{p.s}</Badge>
            </div>
            <div className="mt-4"><div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Avance</span><span>{p.p}%</span></div><div className="h-2 w-full rounded-full bg-muted"><div className="h-2 rounded-full bg-gradient-primary" style={{width:`${p.p}%`}} /></div></div>
            <div className="mt-4 flex gap-2"><Button size="sm" variant="outline">Ver detalle</Button><Button size="sm" variant="ghost">Mensajes</Button></div>
          </Card>
        ))}
      </div>
    </DashboardShell>
  ),
});
