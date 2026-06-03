import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Building2, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Crear cuenta · SkilltoMoney" },
      { name: "description", content: "Crea tu cuenta en SkilltoMoney en menos de 2 minutos." },
    ],
  }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"freelancer" | "client">("freelancer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [dni, setDni] = useState("");
  const [ruc, setRuc] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response =
        role === "freelancer"
          ? await api.registerFreelancer({
              first_name: firstName,
              last_name: lastName,
              dni,
              email,
              password,
            })
          : await api.registerMype({
              first_name: firstName,
              last_name: lastName,
              company_name: companyName || undefined,
              ruc,
              email,
              password,
            });

      if (!response.data) {
        throw new Error("No se recibió sesión.");
      }

      saveSession(response.data.access_token, response.data.user);
      navigate({ to: role === "freelancer" ? "/dashboard/freelancer" : "/dashboard/client" });
    } catch (err: unknown) {
      const payload = err as { message?: string; errors?: Record<string, string[]> };
      const firstError = Object.values(payload?.errors ?? {})[0]?.[0];
      setError(firstError ?? payload?.message ?? "No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crea tu cuenta gratis"
      subtitle="Empieza a vender o a contratar talento digital en minutos."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <div className="mb-6 rounded-2xl border border-border bg-muted/30 p-2 shadow-soft">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { v: "freelancer", l: "Freelancer", i: Briefcase },
              { v: "client", l: "MYPE / Cliente", i: Building2 },
            ] as const
          ).map((option) => (
            <button
              key={option.v}
              type="button"
              onClick={() => setRole(option.v)}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                role === option.v
                  ? "border-primary bg-background text-foreground shadow-soft"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
              aria-pressed={role === option.v}
            >
              <option.i className="h-4 w-4" />
              {option.l}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="font-semibold text-foreground">
              {role === "freelancer" ? "Registro para freelancer" : "Registro para MYPE o cliente"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {role === "freelancer"
                ? "Usaremos tu DNI para validar tu cuenta como talento digital."
                : "Validaremos tu RUC y completaremos la razón social automáticamente."}
            </p>
          </div>
        </div>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input
              placeholder="Camila"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Apellido</Label>
            <Input
              placeholder="Rojas"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        {role === "client" ? (
          <>
            <div className="space-y-1.5">
              <Label>Empresa</Label>
              <Input
                placeholder="Lumen Café"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>RUC</Label>
              <Input
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={11}
                placeholder="11 dígitos"
                value={ruc}
                onChange={(e) => setRuc(e.target.value.replace(/\D/g, "").slice(0, 11))}
                required
              />
            </div>
          </>
        ) : (
          <div className="space-y-1.5">
            <Label>DNI</Label>
            <Input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              placeholder="8 dígitos"
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
              required
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Correo electrónico</Label>
          <Input
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Contraseña</Label>
          <Input
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button
          className="w-full bg-gradient-primary shadow-soft"
          size="lg"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creando..." : "Crear cuenta gratis"}
        </Button>
      </form>
    </AuthLayout>
  );
}
