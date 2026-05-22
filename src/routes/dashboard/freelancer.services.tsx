import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit3, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/dashboard/freelancer/services")({
  head: () => ({ meta: [{ title: "Mis servicios · SkilltoMoney" }] }),
  component: () => (
    <DashboardShell role="freelancer">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Mis servicios</h1>
          <p className="text-muted-foreground">Administra los paquetes que ofreces a tus clientes.</p>
        </div>
        <Button className="bg-gradient-primary shadow-soft"><Plus className="mr-1 h-4 w-4" /> Crear servicio</Button>
      </div>
      <div className="mt-6 space-y-4">
        {[
          { t: "Logo profesional + manual de marca", p: 120, d: 3, views: 240, orders: 12, active: true },
          { t: "Plan de contenido mensual IG", p: 350, d: 7, views: 180, orders: 7, active: true },
          { t: "Rediseño UX/UI de tu landing", p: 520, d: 10, views: 92, orders: 2, active: false },
        ].map(s=>(
          <Card key={s.t} className="p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-[220px]">
                <div className="flex items-center gap-2">
                  <div className="font-display font-semibold">{s.t}</div>
                  {s.active ? <Badge className="bg-success/15 text-success">Activo</Badge> : <Badge variant="outline">Pausado</Badge>}
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>💰 S/ {s.p}</span>
                  <span>⏱ {s.d} días</span>
                  <span>👁 {s.views} vistas</span>
                  <span>📦 {s.orders} pedidos</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked={s.active} />
                <Button variant="outline" size="sm"><BarChart3 className="mr-1 h-3.5 w-3.5" /> Estadísticas</Button>
                <Button variant="ghost" size="sm"><Edit3 className="mr-1 h-3.5 w-3.5" /> Editar</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </DashboardShell>
  ),
});
