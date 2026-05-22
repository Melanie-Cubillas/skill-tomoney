import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { transactions } from "@/data/mock";
import { Wallet, Shield, ArrowDownToLine, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/dashboard/payments")({
  head: () => ({ meta: [{ title: "Pagos · SkilltoMoney" }] }),
  component: () => (
    <DashboardShell role="freelancer">
      <h1 className="font-display text-3xl font-bold">Pagos y escrow</h1>
      <p className="text-muted-foreground">Tus ingresos están seguros con pagos protegidos.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-0 bg-gradient-hero p-6 text-primary-foreground shadow-glow">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs"><Wallet className="h-3.5 w-3.5" /> Balance disponible</div>
            <div className="mt-2 font-display text-4xl font-bold">S/ 1,420</div>
            <Button className="mt-4 w-full bg-white/15 text-primary-foreground backdrop-blur hover:bg-white/25"><ArrowDownToLine className="mr-1.5 h-4 w-4" /> Retirar</Button>
          </div>
        </Card>
        <Card className="p-6 shadow-soft">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Shield className="h-3.5 w-3.5 text-primary" /> En escrow</div>
          <div className="mt-2 font-display text-4xl font-bold">S/ 870</div>
          <div className="mt-2 text-xs text-muted-foreground">Se libera al entregar el proyecto.</div>
        </Card>
        <Card className="p-6 shadow-soft">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingUp className="h-3.5 w-3.5 text-success" /> Este mes</div>
          <div className="mt-2 font-display text-4xl font-bold">S/ 2,140</div>
          <div className="mt-2 text-xs text-success">+24% vs mes anterior</div>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden p-0 shadow-soft">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display font-semibold">Transacciones recientes</h2>
          <Button variant="ghost" size="sm">Exportar</Button>
        </div>
        <div className="divide-y divide-border">
          {transactions.map(t=>(
            <div key={t.id} className="flex items-center justify-between px-6 py-4 text-sm">
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-muted-foreground">{t.client} · {t.date}</div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className={
                  t.status === "Liberado" ? "bg-success/15 text-success" :
                  t.status === "En escrow" ? "bg-accent text-accent-foreground" :
                  "bg-warning/20 text-foreground"
                }>{t.status}</Badge>
                <div className="font-display font-bold">S/ {t.amount}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashboardShell>
  ),
});
