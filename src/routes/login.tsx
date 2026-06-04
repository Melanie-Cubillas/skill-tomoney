import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión · SkilltoMoney" },
      { name: "description", content: "Accede a tu cuenta de SkilltoMoney." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.login({ email, password });
      if (!response.data) {
        throw new Error("No se recibió sesión.");
      }

      saveSession(response.data.access_token, response.data.user);
      navigate({
        to:
          response.data.user.account_type === "mype"
            ? "/dashboard/client"
            : "/dashboard/freelancer",
      });
    } catch (err: unknown) {
      const payload = err as { message?: string; errors?: Record<string, string[]> };
      setError(payload?.errors?.email?.[0] ?? payload?.message ?? "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Bienvenido de vuelta"
      subtitle="Inicia sesión para seguir creciendo con tus habilidades."
      footer={
        <>
          ¿Aún no tienes cuenta?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Regístrate gratis
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Label htmlFor="pw">Contraseña</Label>
            <Link to="/forgot" className="text-xs font-semibold text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input
            id="pw"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button
          className="w-full bg-gradient-primary shadow-soft"
          size="lg"
          type="submit"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Entrar"}
        </Button>
      </form>
    </AuthLayout>
  );
}
