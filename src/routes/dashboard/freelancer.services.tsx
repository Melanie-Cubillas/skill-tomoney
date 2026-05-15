import { createFileRoute } from "@tanstack/react-router";
import { Plus, Edit, MoreHorizontal } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/dashboard/freelancer/services")({
  head: () => ({ meta: [{ title: "Mis servicios · SkilltoMoney" }] }),
  component: () => (
    <DashboardShell role="freelancer">
      <h1 className="font-display text-3xl font-bold">Mis servicios</h1>
      <p className="text-muted-foreground">Define qué ofreces, tu precio y tiempo de entrega.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          {[
            {t:"Diseño de logo profesional + manual de marca",c:"Diseño gráfico",p:120,d:3,s:"Activo"},
            {t:"Pack 12 posts mensuales para Instagram",c:"Marketing",p:280,d:7,s:"Activo"},
            {t:"Edición de 5 reels en CapCut",c:"Video",p:150,d:4,s:"Pausado"},
          ].map(s=>(
            <Card key={s.t} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">{s.c}</Badge>
                  <div className="mt-2 font-semibold">{s.t}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Entrega en {s.d} días</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gradient">S/ {s.p}</div>
                  <Badge className={s.s==="Activo"?"bg-success/15 text-success mt-2":"bg-muted text-muted-foreground mt-2"}>{s.s}</Badge>
                </div>
              </div>
              <div className="mt-3 flex gap-2 border-t border-border pt-3"><Button size="sm" variant="ghost"><Edit className="mr-1 h-3.5 w-3.5" /> Editar</Button><Button size="sm" variant="ghost"><MoreHorizontal className="h-3.5 w-3.5" /></Button></div>
            </Card>
          ))}
        </div>
        <Card className="h-fit p-6">
          <div className="mb-4 flex items-center gap-2 font-semibold"><Plus className="h-4 w-4 text-primary" /> Publicar nuevo servicio</div>
          <div className="space-y-3">
            <div><Label>Título</Label><Input placeholder="Ej: Edición de video TikTok" /></div>
            <div><Label>Categoría</Label>
              <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option>Diseño gráfico</option><option>Edición de video</option><option>Marketing</option><option>Desarrollo web</option></select>
            </div>
            <div><Label>Descripción</Label><Textarea placeholder="¿Qué incluye tu servicio?" /></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Precio (S/)</Label><Input type="number" placeholder="120" /></div><div><Label>Días</Label><Input type="number" placeholder="3" /></div></div>
            <Button className="w-full bg-gradient-primary">Publicar servicio</Button>
          </div>
        </Card>
      </div>
    </DashboardShell>
  ),
});
