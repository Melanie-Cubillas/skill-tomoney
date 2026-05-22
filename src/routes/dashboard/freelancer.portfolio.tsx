import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { portfolio } from "@/data/mock";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/dashboard/freelancer/portfolio")({
  head: () => ({ meta: [{ title: "Portafolio · SkilltoMoney" }] }),
  component: () => (
    <DashboardShell role="freelancer">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Tu portafolio</h1>
          <p className="text-muted-foreground">Sube tus mejores trabajos para atraer más clientes.</p>
        </div>
        <Button className="bg-gradient-primary shadow-soft"><Plus className="mr-1 h-4 w-4" /> Subir proyecto</Button>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {portfolio.map(p=>(
          <Card key={p.id} className="group overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-elegant">
            <div className={`relative grid h-44 place-items-center bg-gradient-to-br ${p.color}`}>
              <span className="text-6xl">{p.emoji}</span>
              <Badge className="absolute left-3 top-3 bg-black/30 text-white backdrop-blur">{p.category}</Badge>
            </div>
            <div className="p-4">
              <div className="font-display font-semibold">{p.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">Publicado · Hace 5 días</div>
            </div>
          </Card>
        ))}
        <button className="grid min-h-[260px] place-items-center rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground transition hover:border-primary hover:text-primary">
          <div className="text-center"><Plus className="mx-auto h-6 w-6" /><div className="mt-1 font-medium">Añadir proyecto</div></div>
        </button>
      </div>
    </DashboardShell>
  ),
});
