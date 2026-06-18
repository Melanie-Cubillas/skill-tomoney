import { Link, createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowDownToLine, ArrowLeft, CheckCircle2, FileUp, Loader2, MessageSquareWarning, ShieldCheck, XCircle } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { API_ROOT_URL, api, type ContractPayload } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/contracts/$contractId")({
  head: () => ({ meta: [{ title: "Detalle de contrato - SkilltoMoney" }] }),
  component: ContractDetailPage,
});

const statusLabels: Record<string, string> = {
  pending_payment: "Pago pendiente",
  in_progress: "En progreso",
  submitted_for_review: "En revisión",
  revision_requested: "Cambios solicitados",
  approved: "Aprobado",
  released: "Liberado",
  disputed: "En disputa",
  cancelled: "Cancelado",
};

function ContractDetailPage() {
  const token = getToken();
  const user = getSessionUser();
  const role = user?.account_type === "mype" ? "client" : "freelancer";
  const { contractId } = Route.useParams();
  const [contract, setContract] = useState<ContractPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [revisionComment, setRevisionComment] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [previewFiles, setPreviewFiles] = useState<FileList | null>(null);
  const [finalFiles, setFinalFiles] = useState<FileList | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.getContract(token, Number(contractId));
      setContract(response.data ?? null);
    } catch (err: unknown) {
      const payload = err as { message?: string };
      setError(payload?.message ?? "No se pudo cargar el contrato.");
    } finally {
      setLoading(false);
    }
  }, [contractId, token]);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = async (action: () => Promise<ContractPayload | null>) => {
    setSaving(true);
    setError(null);
    try {
      const next = await action();
      if (next) setContract(next);
    } catch (err: unknown) {
      const payload = err as { message?: string };
      setError(payload?.message ?? "No se pudo completar la acción.");
    } finally {
      setSaving(false);
    }
  };

  const submitDelivery = async () => {
    if (!token || !contract) return;
    const body = new FormData();
    if (message.trim()) body.append("message", message.trim());
    Array.from(previewFiles ?? []).forEach((file) => body.append("preview_files[]", file));
    Array.from(finalFiles ?? []).forEach((file) => body.append("final_files[]", file));
    await runAction(async () => {
      const response = await api.deliverContract(token, contract.id, body);
      setMessage("");
      setPreviewFiles(null);
      setFinalFiles(null);
      return response.data;
    });
  };

  const canPay = role === "client" && contract?.status === "pending_payment";
  const canReview = role === "client" && contract?.status === "submitted_for_review";
  const canDeliver = role === "freelancer" && ["in_progress", "revision_requested", "submitted_for_review"].includes(contract?.status ?? "");
  const canDispute = contract && !["released", "cancelled"].includes(contract.status);

  return (
    <DashboardShell role={role}>
      <div className="space-y-6">
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/dashboard/contracts">
            <ArrowLeft className="h-4 w-4" />
            Volver a contratos
          </Link>
        </Button>

        {loading ? (
          <div className="grid place-items-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error && !contract ? (
          <EmptyState title="No pudimos cargar el contrato" detail={error} />
        ) : contract ? (
          <>
            <Card className="rounded-2xl p-6 shadow-soft">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-secondary/15 text-secondary">{statusLabels[contract.status] ?? contract.status}</Badge>
                    <span className="text-xs text-muted-foreground">{contract.contract_number}</span>
                  </div>
                  <h1 className="mt-3 font-display text-3xl font-bold">{contract.title}</h1>
                  <p className="mt-2 max-w-3xl text-muted-foreground">{contract.description ?? "Contrato de servicio digital protegido por escrow."}</p>
                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <span>MYPE: <strong className="text-foreground">{contract.mype.name}</strong></span>
                    <span>Freelancer: <strong className="text-foreground">{contract.freelancer.name}</strong></span>
                    <span>Servicio: <strong className="text-foreground">{contract.service?.title ?? "Personalizado"}</strong></span>
                    <span>Monto: <strong className="text-foreground">S/ {contract.amount.toFixed(2)}</strong></span>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-muted/20 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Estado del escrow
                  </div>
                  <div className="mt-2 font-display text-2xl font-bold">
                    {contract.escrow ? `S/ ${contract.escrow.amount.toFixed(2)}` : "Sin pago"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {contract.escrow?.status ?? "Pendiente de pago"}
                  </div>
                </div>
              </div>

              {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

              <div className="mt-6 flex flex-wrap gap-2">
                {canPay ? (
                  <Button
                    onClick={() => runAction(async () => (await api.mockPayContract(token!, contract.id)).data)}
                    disabled={saving}
                    className="rounded-xl bg-gradient-primary"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    Pagar con mock escrow
                  </Button>
                ) : null}
                {canReview ? (
                  <>
                    <Button
                      onClick={() => runAction(async () => (await api.approveContract(token!, contract.id)).data)}
                      disabled={saving}
                      className="rounded-xl bg-gradient-primary"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Aprobar y liberar
                    </Button>
                    <Button
                      onClick={() => runAction(async () => (await api.requestContractRevision(token!, contract.id, revisionComment)).data)}
                      disabled={saving || revisionComment.trim().length < 5}
                      variant="outline"
                      className="rounded-xl"
                    >
                      <MessageSquareWarning className="h-4 w-4" />
                      Pedir cambios
                    </Button>
                  </>
                ) : null}
                {canDispute ? (
                  <Button
                    onClick={() => runAction(async () => (await api.disputeContract(token!, contract.id, disputeReason)).data)}
                    disabled={saving || disputeReason.trim().length < 10}
                    variant="outline"
                    className="rounded-xl text-destructive"
                  >
                    <XCircle className="h-4 w-4" />
                    Abrir disputa
                  </Button>
                ) : null}
              </div>
            </Card>

            {canDeliver ? (
              <Card className="rounded-2xl p-6 shadow-soft">
                <h2 className="font-display text-xl font-bold">Entregar trabajo</h2>
                <p className="text-sm text-muted-foreground">
                  Sube una versión de revisión y, si ya tienes el material final, adjúntalo bloqueado hasta aprobación.
                </p>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="mt-4 min-h-24 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder="Describe qué estás entregando..."
                />
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="rounded-xl border border-dashed border-border p-4 text-sm">
                    <span className="font-semibold">Archivos de revisión</span>
                    <span className="mt-1 block text-xs text-muted-foreground">La MYPE puede verlos como preview.</span>
                    <input type="file" multiple className="mt-3 block w-full text-xs" onChange={(e) => setPreviewFiles(e.target.files)} />
                  </label>
                  <label className="rounded-xl border border-dashed border-border p-4 text-sm">
                    <span className="font-semibold">Archivos finales bloqueados</span>
                    <span className="mt-1 block text-xs text-muted-foreground">Se desbloquean al aprobar o liberar escrow.</span>
                    <input type="file" multiple className="mt-3 block w-full text-xs" onChange={(e) => setFinalFiles(e.target.files)} />
                  </label>
                </div>
                <Button onClick={() => void submitDelivery()} disabled={saving} className="mt-4 rounded-xl bg-gradient-primary">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                  Enviar entrega
                </Button>
              </Card>
            ) : null}

            {canReview || canDispute ? (
              <Card className="rounded-2xl p-6 shadow-soft">
                <h2 className="font-display text-xl font-bold">Comentarios de revisión</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {canReview ? (
                    <textarea
                      value={revisionComment}
                      onChange={(event) => setRevisionComment(event.target.value)}
                      className="min-h-24 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                      placeholder="Comentario obligatorio para pedir cambios..."
                    />
                  ) : null}
                  {canDispute ? (
                    <textarea
                      value={disputeReason}
                      onChange={(event) => setDisputeReason(event.target.value)}
                      className="min-h-24 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                      placeholder="Motivo de disputa, mínimo 10 caracteres..."
                    />
                  ) : null}
                </div>
              </Card>
            ) : null}

            <Card className="rounded-2xl p-6 shadow-soft">
              <h2 className="font-display text-xl font-bold">Entregas</h2>
              <div className="mt-4 space-y-4">
                {contract.deliveries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aún no hay entregas.</p>
                ) : (
                  contract.deliveries.map((delivery) => (
                    <div key={delivery.id} className="rounded-xl border border-border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="font-semibold">{delivery.title ?? `Entrega ${delivery.revision_round}`}</div>
                          <div className="text-xs text-muted-foreground">Ronda {delivery.revision_round}</div>
                        </div>
                        <Badge variant="outline">{delivery.status}</Badge>
                      </div>
                      {delivery.message ? <p className="mt-2 text-sm text-muted-foreground">{delivery.message}</p> : null}
                      {delivery.review_comment ? (
                        <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm">Cambios solicitados: {delivery.review_comment}</p>
                      ) : null}
                      <div className="mt-3 grid gap-2">
                        {delivery.files.map((file) => {
                          const url = `${API_ROOT_URL}${file.download_url}`;
                          return (
                            <a
                              key={file.id}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className={`flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm ${file.is_final && !file.downloadable ? "pointer-events-none opacity-55" : "hover:bg-muted/40"}`}
                            >
                              <span>
                                {file.original_name}
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {file.is_preview ? "Preview" : file.downloadable ? "Final desbloqueado" : "Final bloqueado"}
                                </span>
                              </span>
                              <ArrowDownToLine className="h-4 w-4" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </>
        ) : null}
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
