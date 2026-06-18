import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDownToLine, Loader2, Shield, TrendingUp, Wallet } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, type WalletPayload } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/payments")({
  head: () => ({ meta: [{ title: "Wallet - SkilltoMoney" }] }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const token = getToken();
  const user = getSessionUser();
  const role = user?.account_type === "mype" ? "client" : "freelancer";
  const [wallet, setWallet] = useState<WalletPayload["wallet"] | null>(null);
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.getWallet(token);
        setWallet(response.data?.wallet ?? null);
      } catch (err: unknown) {
        const payload = err as { message?: string };
        setError(payload?.message ?? "No se pudo cargar la wallet.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [token]);

  const requestWithdrawal = async () => {
    if (!token || saving) return;
    setSaving(true);
    setError(null);
    try {
      const response = await api.requestWithdrawal(token, {
        amount: Number(amount),
        method: "mock",
        destination: destination || undefined,
      });
      setWallet(response.data?.wallet ?? null);
      setAmount("");
      setDestination("");
    } catch (err: unknown) {
      const payload = err as { message?: string };
      setError(payload?.message ?? "No se pudo solicitar el retiro.");
    } finally {
      setSaving(false);
    }
  };

  const transactions = wallet?.transactions ?? [];
  const withdrawals = wallet?.withdrawals ?? [];
  const monthlyTotal = transactions
    .filter((transaction) => transaction.direction === "credit")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <DashboardShell role={role}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Wallet y escrow</h1>
          <p className="text-muted-foreground">Tus movimientos y pagos protegidos se gestionan dentro del modo actual de tu cuenta.</p>
        </div>

        {loading ? (
          <div className="grid place-items-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="relative overflow-hidden border-0 bg-gradient-hero p-6 text-primary-foreground shadow-glow">
                <div className="absolute inset-0 grid-pattern opacity-30" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-xs"><Wallet className="h-3.5 w-3.5" /> Balance disponible</div>
                  <div className="mt-2 font-display text-4xl font-bold">S/ {(wallet?.available_balance ?? 0).toFixed(2)}</div>
                  <div className="mt-2 text-xs opacity-80">Solo incluye dinero liberado, no escrow retenido.</div>
                </div>
              </Card>
              <Card className="p-6 shadow-soft">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Shield className="h-3.5 w-3.5 text-primary" /> En escrow</div>
                <div className="mt-2 font-display text-4xl font-bold">S/ {(wallet?.escrow_balance ?? 0).toFixed(2)}</div>
                <div className="mt-2 text-xs text-muted-foreground">Fondos protegidos hasta aprobación o resolución.</div>
              </Card>
              <Card className="p-6 shadow-soft">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingUp className="h-3.5 w-3.5 text-success" /> Ingresos liberados</div>
                <div className="mt-2 font-display text-4xl font-bold">S/ {monthlyTotal.toFixed(2)}</div>
                <div className="mt-2 text-xs text-muted-foreground">Suma de créditos registrados en tu wallet.</div>
              </Card>
            </div>

            {role === "freelancer" ? (
              <Card className="p-6 shadow-soft">
                <h2 className="font-display text-xl font-bold">Solicitar retiro</h2>
                <p className="text-sm text-muted-foreground">MVP con provider mock. El monto mínimo de retiro es S/ 50.</p>
                <div className="mt-4 grid gap-3 md:grid-cols-[180px_1fr_auto]">
                  <input
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    type="number"
                    min={50}
                    className="rounded-xl border border-input bg-background px-4 py-2 text-sm outline-none focus:border-primary"
                    placeholder="Monto"
                  />
                  <input
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                    className="rounded-xl border border-input bg-background px-4 py-2 text-sm outline-none focus:border-primary"
                    placeholder="Destino mock, Yape, Plin o cuenta"
                  />
                  <Button
                    onClick={() => void requestWithdrawal()}
                    disabled={saving || Number(amount) < 50}
                    className="rounded-xl bg-gradient-primary"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownToLine className="h-4 w-4" />}
                    Retirar
                  </Button>
                </div>
              </Card>
            ) : null}

            <Card className="overflow-hidden p-0 shadow-soft">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className="font-display font-semibold">Transacciones recientes</h2>
              </div>
              <div className="divide-y divide-border">
                {transactions.length === 0 ? (
                  <div className="px-6 py-10 text-center text-sm text-muted-foreground">Aún no hay transacciones reales.</div>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between px-6 py-4 text-sm">
                      <div>
                        <div className="font-medium">{transaction.description ?? transaction.type}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleString("es-PE")}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={transaction.direction === "credit" ? "default" : "outline"}>{transaction.type}</Badge>
                        <div className="font-display font-bold">
                          {transaction.direction === "credit" ? "+" : "-"} S/ {transaction.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {withdrawals.length > 0 ? (
              <Card className="overflow-hidden p-0 shadow-soft">
                <div className="border-b border-border px-6 py-4">
                  <h2 className="font-display font-semibold">Retiros</h2>
                </div>
                <div className="divide-y divide-border">
                  {withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex items-center justify-between px-6 py-4 text-sm">
                      <div>
                        <div className="font-medium">Retiro mock</div>
                        <div className="text-xs text-muted-foreground">
                          {withdrawal.requested_at ? new Date(withdrawal.requested_at).toLocaleString("es-PE") : "Sin fecha"}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{withdrawal.status}</Badge>
                        <div className="font-display font-bold">S/ {withdrawal.amount.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
