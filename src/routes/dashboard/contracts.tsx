import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, FileCheck2, Loader2, ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, type ContractPayload } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/contracts")({
  head: () => ({ meta: [{ title: "Contratos - SkilltoMoney" }] }),
  component: ContractsPage,
});

const statusLabels: Record<string, string> = {
  pending_payment: "Pago pendiente",
  in_escrow: "En escrow",
  in_progress: "En progreso",
  submitted_for_review: "En revisión",
  revision_requested: "Cambios solicitados",
  approved: "Aprobado",
  released: "Liberado",
  disputed: "En disputa",
  cancelled: "Cancelado",
};

function ContractsPage() {
  const token = getToken();
  const user = getSessionUser();
  const role = user?.account_type === "mype" ? "client" : "freelancer";
  const [contracts, setContracts] = useState<ContractPayload[]>([]);
  const [loading, setLoading] = useState(true);
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
        const response = await api.getContracts(token);
        setContracts(response.data?.contracts ?? []);
      } catch (err: unknown) {
        const payload = err as { message?: string };
        setError(payload?.message ?? "No se pudieron cargar los contratos.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [token]);

  return (
    <DashboardShell role={role}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Contratos</h1>
          <p className="text-muted-foreground">
            Gestiona pagos protegidos, entregas, revisiones y liberación de escrow.
          </p>
        </div>

        {loading ? (
          <div className="grid place-items-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <EmptyState title="No pudimos cargar contratos" detail={error} />
        ) : contracts.length === 0 ? (
          <EmptyState
            title="Aún no hay contratos"
            detail={role === "client" ? "Crea un contrato desde el detalle de un servicio." : "Cuando una MYPE te contrate, aparecerá aquí."}
          />
        ) : (
          <div className="grid gap-4">
            {contracts.map((contract) => (
              <Card key={contract.id} className="rounded-2xl p-5 shadow-soft">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-secondary/15 text-secondary">
                        {statusLabels[contract.status] ?? contract.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{contract.contract_number}</span>
                    </div>
                    <h2 className="mt-2 font-display text-xl font-bold">{contract.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {role === "client" ? contract.freelancer.name : contract.mype.name} · {contract.service?.title ?? contract.client_project?.title ?? "Trabajo personalizado"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="rounded-xl border border-border bg-muted/20 px-4 py-2 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <ShieldCheck className="h-4 w-4 text-primary" /> Escrow
                      </div>
                      <div className="font-display text-lg font-bold">S/ {contract.amount.toFixed(2)}</div>
                    </div>
                    <Button asChild className="rounded-xl bg-gradient-primary">
                      <Link to="/dashboard/contracts/$contractId" params={{ contractId: String(contract.id) }}>
                        <FileCheck2 className="h-4 w-4" />
                        Ver contrato
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Creado el {new Date(contract.created_at).toLocaleDateString("es-PE")}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center shadow-soft">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}
