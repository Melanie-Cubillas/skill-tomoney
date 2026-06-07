import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Restablecer contraseña · Skill-to-Money" }] }),
  validateSearch: (search) => ({
    token: typeof search.token === "string" ? search.token : "",
    email: typeof search.email === "string" ? search.email : "",
  }),
  component: ResetPasswordPage,
});

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 10;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 20;
  if (/\d/.test(password)) score += 20;
  if (/[^a-zA-Z0-9]/.test(password)) score += 25;

  if (score <= 25) return { score, label: "Débil", color: "bg-red-500" };
  if (score <= 50) return { score, label: "Regular", color: "bg-orange-500" };
  if (score <= 75) return { score, label: "Buena", color: "bg-yellow-500" };
  return { score, label: "Segura", color: "bg-green-500" };
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token, email } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const strength = getPasswordStrength(password);
  const emailTerm = email.split("@")[0]?.trim().toLowerCase() ?? "";
  const usesPersonalInfo = emailTerm.length >= 3 && password.toLowerCase().includes(emailTerm);
  const passwordRequirements = [
    { label: "Mínimo 8 caracteres", met: password.length >= 8 },
    { label: "Incluye una letra mayúscula", met: /[A-Z]/.test(password) },
    { label: "Incluye un número", met: /\d/.test(password) },
    { label: "Incluye un símbolo", met: /[^a-zA-Z0-9]/.test(password) },
    { label: "No uses tu correo como contraseña", met: !usesPersonalInfo },
  ];
  const isPasswordValid = passwordRequirements.every((requirement) => requirement.met);
  const matchesConfirmation = password.length > 0 && password === passwordConfirmation;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError("Completa los requisitos de la contraseña antes de continuar.");
      return;
    }
    if (!matchesConfirmation) {
      setError("La confirmación no coincide con la nueva contraseña.");
      return;
    }
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
        <div className="space-y-1.5">
          <Label>Nueva contraseña</Label>
          <Input type="password" placeholder="Minimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          {password.length > 0 && (
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
                  <div className={`h-full transition-all ${strength.color}`} style={{ width: `${strength.score}%` }} />
                </div>
                <span className={`text-xs font-semibold ${strength.color.replace("bg-", "text-")}`}>{strength.label}</span>
              </div>
              <div className="space-y-1 rounded-xl border border-border bg-muted/30 px-3 py-2">
                {passwordRequirements.map((requirement) => (
                  <p key={requirement.label} className={`flex items-center gap-2 text-xs ${requirement.met ? "text-green-700" : "text-red-600"}`}>
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    {requirement.met ? requirement.label : `Falta: ${requirement.label.toLowerCase()}`}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="space-y-1.5"><Label>Confirmar contraseña</Label><Input type="password" placeholder="Repite tu contraseña" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required minLength={8} /></div>
        {passwordConfirmation.length > 0 ? (
          <p className={`text-xs ${matchesConfirmation ? "text-green-700" : "text-red-600"}`}>
            {matchesConfirmation ? "Las contraseñas coinciden." : "Las contraseñas no coinciden."}
          </p>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {done ? <p className="text-sm text-emerald-600">{done}</p> : null}
        <Button className="w-full bg-gradient-primary shadow-soft" size="lg" type="submit" disabled={loading || !token || !email || !isPasswordValid || !matchesConfirmation}>
          {loading ? "Actualizando..." : "Actualizar contraseña"}
        </Button>
      </form>
    </AuthLayout>
  );
}
