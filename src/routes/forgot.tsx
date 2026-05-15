import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot")({
  head: () => ({ meta: [{ title: "Recuperar contraseña · SkilltoMoney" }] }),
  component: () => (
    <AuthLayout title="Recupera tu contraseña" subtitle="Te enviaremos un enlace para restablecerla." footer={<><Link to="/login" className="text-primary">Volver a iniciar sesión</Link></>}>
      <form className="space-y-4">
        <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="tu@email.com" /></div>
        <Button className="w-full bg-gradient-primary">Enviar enlace</Button>
      </form>
    </AuthLayout>
  ),
});
