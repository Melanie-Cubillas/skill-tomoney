import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Clock, CheckCircle2, Wallet } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/payments")({
  head: () => ({ meta: [{ title: "Pagos · SkilltoMoney" }] }),
  component: () => (
    <DashboardShell role="freelancer">
      <h1 className="font-display text-3xl font-bold">Pagos protegidos</h1>
      <p className="text-muted-foreground">Cobros seguros con sistema escrow. Tu dinero, protegido hasta la entrega.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[{l:"Disponible",v:"S/ 820",i:Wallet},{l:"En escrow",v:"S/ 460",i:ShieldCheck},{l:"Liberado este mes",v:"S/ 1,420",i:CheckCircle2}].map(s=>(
          <Card key={s.l} className="p-5"><div className="flex items-center justify-between"><div className="text-sm text-muted-foreground">{s.l}</div><s.i className="h-4 w-4 text-primary" /></div><div className="mt-2 text-2xl font-bold text-gradient">{s.v}</div></Card>
        ))}
      </div>

      <Card className="mt-8 p-6">
        <h3 className="font-display font-semibold">Transacciones recientes</h3>
        <div className="mt-4 space-y-3">
          {[
            {t:"Branding Cafetería Lúmen",c:"Ricardo G.",a:480,s:"En escrow",icon:ShieldCheck,color:"bg-accent text-accent-foreground"},
            {t:"Posts Instagram Boutique Sol",c:"Andrea M.",a:280,s:"Proyecto en progreso",icon:Clock,color:"bg-warning/15 text-warning"},
            {t:"Logo Estudio Aurora",c:"Luis V.",a:120,s:"Pago liberado",icon:CheckCircle2,color:"bg-success/15 text-success"},
            {t:"Reels tienda Verde",c:"María P.",a:200,s:"Pago liberado",icon:CheckCircle2,color:"bg-success/15 text-success"},
          ].map(x=>(
            <div key={x.t} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
              <div className="flex items-center gap-3"><div className={`grid h-10 w-10 place-items-center rounded-xl ${x.color}`}><x.icon className="h-4 w-4" /></div><div><div className="font-medium">{x.t}</div><div className="text-xs text-muted-foreground">Cliente: {x.c}</div></div></div>
              <div className="flex items-center gap-4"><Badge variant="secondary" className={x.color}>{x.s}</Badge><div className="font-bold text-gradient">S/ {x.a}</div></div>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-xl bg-accent/50 p-4 text-sm text-accent-foreground">
          🔒 <b>Pagos protegidos:</b> el cliente paga al inicio, nosotros guardamos el dinero y se libera cuando ambos confirman la entrega.
        </div>
        <Button className="mt-4 bg-gradient-primary">Retirar a mi cuenta</Button>
      </Card>
    </DashboardShell>
  ),
});
