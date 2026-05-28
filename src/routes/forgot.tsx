import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export const Route = createFileRoute("/forgot")({
  head: () => ({ meta: [{ title: "Recuperar contrasena · SkilltoMoney" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDone(null);

    try {
      const response = await api.forgotPassword({ email });
      setDone(response.message || "Si el correo existe, se enviara un enlace.");
    } catch (err: unknown) {
      const payload = err as { message?: string; errors?: Record<string, string[]> };
      setError(payload?.errors?.email?.[0] ?? payload?.message ?? "No se pudo enviar el enlace.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Recupera tu acceso"
      subtitle="Te enviaremos un enlace para restablecer tu contrasena."
      footer={<><Link to="/login" className="font-semibold text-primary hover:underline">Volver a iniciar sesion</Link></>}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5"><Label>Correo electronico</Label><Input type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {done ? <p className="text-sm text-emerald-600">{done}</p> : null}
        <Button className="w-full bg-gradient-primary shadow-soft" size="lg" type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar enlace"}
        </Button>
      </form>
    </AuthLayout>
  );
}

