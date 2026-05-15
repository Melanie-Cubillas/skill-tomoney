import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Iniciar sesión · SkilltoMoney" }] }),
  component: () => (
    <AuthLayout title="Bienvenido de vuelta 👋" subtitle="Ingresa a tu cuenta para continuar." footer={<>¿No tienes cuenta? <Link to="/register" className="font-medium text-primary">Regístrate</Link></>}>
      <form className="space-y-4">
        <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="tu@email.com" /></div>
        <div className="space-y-1.5"><div className="flex justify-between"><Label>Contraseña</Label><Link to="/forgot" className="text-xs text-primary">¿Olvidaste?</Link></div><Input type="password" placeholder="••••••••" /></div>
        <Button className="w-full bg-gradient-primary">Entrar</Button>
        <Button variant="outline" type="button" className="w-full">Continuar con Google</Button>
      </form>
    </AuthLayout>
  ),
});
