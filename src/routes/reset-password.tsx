import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Restablecer contraseña · Skill-to-Money" }] }),
  validateSearch: (search) => ({
    token: typeof search.token === "string" ? search.token : "",
    email: typeof search.email === "string" ? search.email : "",
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token, email } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDone(null);

    try {
      const response = await api.resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setDone(response.message || "Contraseña actualizada correctamente.");
      window.setTimeout(() => navigate({ to: "/login" }), 1200);
    } catch (err: unknown) {
      const payload = err as { message?: string; errors?: Record<string, string[]> };
      const firstError = Object.values(payload?.errors ?? {})[0]?.[0];
      setError(firstError ?? payload?.message ?? "No se pudo actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crea una nueva contraseña"
      subtitle="Ingresa una contraseña segura para recuperar tu acceso."
      asideEyebrow="Recuperación segura"
      asideTitle="Vuelve a tu cuenta sin perder el ritmo."
      asideSubtitle="Usa el enlace temporal enviado a tu correo y define una nueva contraseña para continuar."
      asideStats={[["8+", "caracteres"], ["Token", "temporal"], ["Email", "validado"]]}
      footer={<><Link to="/login" className="font-semibold text-primary hover:underline">Volver a iniciar sesion</Link></>}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5"><Label>Correo</Label><Input type="email" value={email} readOnly /></div>
        <div className="space-y-1.5"><Label>Nueva contraseña</Label><Input type="password" placeholder="Minimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} /></div>
        <div className="space-y-1.5"><Label>Confirmar contraseña</Label><Input type="password" placeholder="Repite tu contraseña" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required minLength={8} /></div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {done ? <p className="text-sm text-emerald-600">{done}</p> : null}
        <Button className="w-full bg-gradient-primary shadow-soft" size="lg" type="submit" disabled={loading || !token || !email}>
          {loading ? "Actualizando..." : "Actualizar contraseña"}
        </Button>
      </form>
    </AuthLayout>
  );
}
