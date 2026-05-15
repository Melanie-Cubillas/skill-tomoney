import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Building2 } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Crear cuenta · SkilltoMoney" }] }),
  component: Register,
});

function Register() {
  const [type, setType] = useState<"freelancer"|"client">("freelancer");
  return (
    <AuthLayout title="Crea tu cuenta" subtitle="Empieza gratis en menos de 2 minutos." footer={<>¿Ya tienes cuenta? <Link to="/login" className="font-medium text-primary">Inicia sesión</Link></>}>
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
        <button onClick={()=>setType("freelancer")} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${type==="freelancer"?"bg-background shadow-soft text-foreground":"text-muted-foreground"}`}>
          <Briefcase className="h-4 w-4" /> Freelancer
        </button>
        <button onClick={()=>setType("client")} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${type==="client"?"bg-background shadow-soft text-foreground":"text-muted-foreground"}`}>
          <Building2 className="h-4 w-4" /> MYPE / Cliente
        </button>
      </div>
      <form className="space-y-4">
        <div className="space-y-1.5"><Label>Nombre completo</Label><Input placeholder={type==="freelancer"?"Camila Rojas":"Tu empresa SAC"} /></div>
        <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="tu@email.com" /></div>
        <div className="space-y-1.5"><Label>Contraseña</Label><Input type="password" placeholder="Mínimo 8 caracteres" /></div>
        <Button className="w-full bg-gradient-primary" asChild>
          <Link to={type==="freelancer"?"/dashboard/freelancer":"/dashboard/client"}>Crear cuenta gratis</Link>
        </Button>
      </form>
    </AuthLayout>
  );
}
