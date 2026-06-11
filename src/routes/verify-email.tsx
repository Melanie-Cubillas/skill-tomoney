import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, MailCheck, XCircle } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/auth";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === "string" ? search.email : "",
    token: typeof search.token === "string" ? search.token : "",
  }),
  head: () => ({
    meta: [
      { title: "Verificar correo · SkilltoMoney" },
      { name: "description", content: "Confirma tu correo para continuar tu registro." },
    ],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const { email, token } = Route.useSearch();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verificando tu correo...");

  useEffect(() => {
    if (!email || !token) {
      setStatus("error");
      setMessage("El enlace de verificación está incompleto.");
      return;
    }

    let cancelled = false;

    api
      .verifyEmail({ email, token })
      .then((response) => {
        if (cancelled) return;

        if (!response.data) {
          throw new Error("No se recibió sesión.");
        }

        saveSession(response.data.access_token, response.data.user);
        setStatus("success");
        setMessage("Correo verificado. Te llevaremos al formulario inicial.");

        window.setTimeout(() => {
          void navigate({
            to:
              response.data?.user.account_type === "mype"
                ? "/mype-onboarding"
                : "/freelancer-onboarding",
          });
        }, 900);
      })
      .catch((err) => {
        if (cancelled) return;
        const payload = err as { message?: string };
        setStatus("error");
        setMessage(payload?.message ?? "No se pudo verificar tu correo.");
      });

    return () => {
      cancelled = true;
    };
  }, [email, navigate, token]);

  return (
    <AuthLayout
      title="Verificación de correo"
      subtitle="Validamos tu enlace para continuar con el registro."
      asideEyebrow="Cuenta segura"
      asideTitle="Un paso más para activar tu perfil."
      asideSubtitle="Confirmar tu correo nos ayuda a proteger tu cuenta y mantener limpio el flujo de contacto."
      footer={
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Volver al inicio de sesión
        </Link>
      }
    >
      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
        {status === "loading" ? (
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        ) : status === "success" ? (
          <CheckCircle2 className="mx-auto h-12 w-12 text-[#00C9BA]" />
        ) : (
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
        )}

        <p className="mt-4 text-sm text-muted-foreground">{message}</p>

        {status === "error" ? (
          <Button asChild className="mt-5 w-full bg-gradient-primary">
            <Link to="/login">
              <MailCheck className="h-4 w-4" />
              Ir a iniciar sesión
            </Link>
          </Button>
        ) : null}
      </div>
    </AuthLayout>
  );
}
