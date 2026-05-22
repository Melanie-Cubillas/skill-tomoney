import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Building2 } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Crear cuenta · SkilltoMoney" }, { name: "description", content: "Crea tu cuenta en SkilltoMoney en menos de 2 minutos." }] }),
  component: Register,
});

function Register() {
  const [role, setRole] = useState<"freelancer" | "client">("freelancer");
  return (
    <AuthLayout
      title="Crea tu cuenta gratis"
      subtitle="Empieza a vender o a contratar talento digital en minutos."
      footer={<>¿Ya tienes cuenta? <Link to="/login" className="font-semibold text-primary hover:underline">Inicia sesión</Link></>}
    >
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-muted/40 p-1.5">
        {([
          { v: "freelancer", l: "Freelancer", i: Briefcase },
          { v: "client", l: "MYPE / Cliente", i: Building2 },
        ] as const).map(o=>(
          <button
            key={o.v}
            type="button"
            onClick={()=>setRole(o.v)}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${role===o.v ? "bg-background text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
          >
            <o.i className="h-4 w-4" /> {o.l}
          </button>
        ))}
      </div>
      <form className="space-y-4" onSubmit={(e)=>e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Nombre</Label><Input placeholder="Camila" /></div>
          <div className="space-y-1.5"><Label>Apellido</Label><Input placeholder="Rojas" /></div>
        </div>
        <div className="space-y-1.5"><Label>Correo</Label><Input type="email" placeholder="tu@correo.com" /></div>
        <div className="space-y-1.5"><Label>Contraseña</Label><Input type="password" placeholder="Mínimo 8 caracteres" /></div>
        <Button className="w-full bg-gradient-primary shadow-soft" size="lg" asChild>
          <Link to={role === "freelancer" ? "/dashboard/freelancer" : "/dashboard/client"}>Crear cuenta gratis</Link>
        </Button>
        <p className="text-center text-xs text-muted-foreground">Al registrarte aceptas los Términos y la Política de Privacidad.</p>
      </form>
    </AuthLayout>
  );
}
