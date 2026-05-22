import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot")({
  head: () => ({ meta: [{ title: "Recuperar contraseña · SkilltoMoney" }] }),
  component: () => (
    <AuthLayout
      title="Recupera tu acceso"
      subtitle="Te enviaremos un enlace para restablecer tu contraseña."
      footer={<><Link to="/login" className="font-semibold text-primary hover:underline">Volver a iniciar sesión</Link></>}
    >
      <form className="space-y-4" onSubmit={(e)=>e.preventDefault()}>
        <div className="space-y-1.5"><Label>Correo electrónico</Label><Input type="email" placeholder="tu@correo.com" /></div>
        <Button className="w-full bg-gradient-primary shadow-soft" size="lg">Enviar enlace</Button>
      </form>
    </AuthLayout>
  ),
});
