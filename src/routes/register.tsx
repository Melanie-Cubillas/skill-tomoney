import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Building2 } from "lucide-react";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Crear cuenta · SkilltoMoney" }, { name: "description", content: "Crea tu cuenta en SkilltoMoney en menos de 2 minutos." }] }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"freelancer" | "client">("freelancer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = role === "freelancer"
        ? await api.registerFreelancer({ first_name: firstName, last_name: lastName, email, password })
        : await api.registerMype({ first_name: firstName, last_name: lastName, company_name: companyName || undefined, email, password });

      if (!response.data) {
        throw new Error("No se recibio sesion.");
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
      footer={<>Ya tienes cuenta? <Link to="/login" className="font-semibold text-primary hover:underline">Inicia sesion</Link></>}
    >
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-muted/40 p-1.5">
        {([
          { v: "freelancer", l: "Freelancer", i: Briefcase },
          { v: "client", l: "MYPE / Cliente", i: Building2 },
        ] as const).map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => setRole(o.v)}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${role === o.v ? "bg-background text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
          >
            <o.i className="h-4 w-4" /> {o.l}
          </button>
        ))}
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Nombre</Label><Input placeholder="Camila" value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></div>
          <div className="space-y-1.5"><Label>Apellido</Label><Input placeholder="Rojas" value={lastName} onChange={(e) => setLastName(e.target.value)} required /></div>
        </div>
        {role === "client" ? (
          <div className="space-y-1.5"><Label>Empresa</Label><Input placeholder="Lumen Cafe" value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
        ) : null}
        <div className="space-y-1.5"><Label>Correo</Label><Input type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="space-y-1.5"><Label>Contrasena</Label><Input type="password" placeholder="Minimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} /></div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button className="w-full bg-gradient-primary shadow-soft" size="lg" type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear cuenta gratis"}
        </Button>
      </form>
    </AuthLayout>
  );
}

