import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { api, API_BASE_URL } from "@/lib/api";

type Status = "loading" | "ok" | "error";

export function BackendStatus() {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string>("Conectando al backend...");

  useEffect(() => {
    let cancelled = false;
    api
      .health()
      .then(() => {
        if (cancelled) return;
        setStatus("ok");
        setMessage("Backend conectado correctamente");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
        setMessage("No se pudo conectar al backend");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const color =
    status === "ok"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
      : status === "error"
      ? "border-red-400/30 bg-red-400/10 text-red-200"
      : "border-white/15 bg-white/5 text-white/70";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs backdrop-blur ${color}`}
      title={API_BASE_URL}
    >
      {status === "loading" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {status === "ok" && <CheckCircle2 className="h-3.5 w-3.5" />}
      {status === "error" && <AlertCircle className="h-3.5 w-3.5" />}
      <span>{message}</span>
    </div>
  );
}