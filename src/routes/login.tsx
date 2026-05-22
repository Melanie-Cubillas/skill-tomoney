import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Iniciar sesión · SkilltoMoney" }, { name: "description", content: "Accede a tu cuenta de SkilltoMoney" }] }),
  component: () => (
    <AuthLayout
      title="Bienvenid@ de vuelta 👋"
      subtitle="Inicia sesión para seguir creciendo con tus skills."
      footer={<>¿Aún no tienes cuenta? <Link to="/register" className="font-semibold text-primary hover:underline">Regístrate gratis</Link></>}
    >
      <form className="space-y-4" onSubmit={(e)=>e.preventDefault()}>
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" type="email" placeholder="tu@correo.com" />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Label htmlFor="pw">Contraseña</Label>
            <Link to="/forgot" className="text-xs text-primary hover:underline">¿Olvidaste?</Link>
          </div>
          <Input id="pw" type="password" placeholder="••••••••" />
        </div>
        <Button className="w-full bg-gradient-primary shadow-soft" size="lg" asChild>
          <Link to="/dashboard/freelancer">Entrar</Link>
        </Button>
        <div className="relative my-4 text-center text-xs text-muted-foreground">
          <span className="bg-background px-2">o continúa con</span>
          <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" type="button">Google</Button>
          <Button variant="outline" type="button">GitHub</Button>
        </div>
      </form>
    </AuthLayout>
  ),
});
