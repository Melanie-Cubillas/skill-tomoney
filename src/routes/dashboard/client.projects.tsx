import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/mock";

export const Route = createFileRoute("/dashboard/client/projects")({
  head: () => ({ meta: [{ title: "Mis proyectos · SkilltoMoney" }] }),
  component: () => (
    <DashboardShell role="client">
      <h1 className="font-display text-3xl font-bold">Mis proyectos</h1>
      <p className="text-muted-foreground">Sigue el avance de cada contratación en tiempo real.</p>
      <div className="mt-6 space-y-4">
        {projects.map(p=>(
          <Card key={p.id} className="p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-display font-semibold">{p.title}</div>
                <div className="text-xs text-muted-foreground">Freelancer: {p.freelancer}</div>
              </div>
              <Badge className="bg-accent text-accent-foreground">{p.status}</Badge>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Avance</span><span>{p.progress}%</span></div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${p.progress}%` }} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline">Ver detalle</Button>
              <Button size="sm" variant="ghost">Mensajes</Button>
              <Button size="sm" className="ml-auto bg-gradient-primary">Liberar pago</Button>
            </div>
          </Card>
        ))}
      </div>
    </DashboardShell>
  ),
});
