import { createFileRoute } from "@tanstack/react-router";
import { Plus, Image as ImageIcon } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/freelancer/portfolio")({
  head: () => ({ meta: [{ title: "Portafolio · SkilltoMoney" }] }),
  component: () => (
    <DashboardShell role="freelancer">
      <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div><h1 className="font-display text-3xl font-bold">Mi portafolio</h1><p className="text-muted-foreground">Sube tus mejores proyectos para atraer clientes.</p></div>
        <Button className="bg-gradient-primary"><Plus className="mr-1 h-4 w-4" /> Nuevo proyecto</Button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {t:"Branding Cafetería Lúmen",c:"Branding"},
          {t:"Posts Instagram para Boutique Sol",c:"Social Media"},
          {t:"Logo Estudio Aurora",c:"Logo"},
          {t:"Identidad visual app Tika",c:"UX/UI"},
          {t:"Reels para tienda Verde",c:"Video"},
        ].map(p=>(
          <Card key={p.t} className="overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-glow">
            <div className="grid aspect-[4/3] place-items-center bg-gradient-primary text-primary-foreground"><ImageIcon className="h-10 w-10 opacity-70" /></div>
            <div className="p-4"><Badge className="mb-2 bg-accent text-accent-foreground">{p.c}</Badge><div className="font-semibold">{p.t}</div></div>
          </Card>
        ))}
        <Card className="grid aspect-[4/3] place-items-center border-dashed text-muted-foreground hover:border-primary hover:text-primary cursor-pointer">
          <div className="text-center"><Plus className="mx-auto h-8 w-8" /><div className="mt-2 text-sm">Agregar proyecto</div></div>
        </Card>
      </div>
    </DashboardShell>
  ),
});
