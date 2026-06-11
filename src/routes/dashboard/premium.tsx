import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Crown, Sparkles } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/premium")({
  head: () => ({ meta: [{ title: "Planes - SkilltoMoney" }] }),
  component: DashboardPremiumPage,
});

function DashboardPremiumPage() {
  const user = getSessionUser();
  const role = user?.account_type === "mype" ? "client" : "freelancer";
  const isMype = user?.account_type === "mype";

  const plans = isMype
    ? [
        {
          name: "Free",
          price: "S/ 0",
          desc: "Para probar la busqueda de talento.",
          features: ["1 publicacion activa", "Buscar freelancers", "Guardar favoritos", "Explorar servicios"],
          current: true,
        },
        {
          name: "Pro",
          price: "S/ 29",
          desc: "Para contratar con mas velocidad.",
          features: ["Publicaciones ilimitadas", "Mayor visibilidad para tus proyectos", "Recomendaciones avanzadas", "Soporte prioritario"],
          current: false,
        },
      ]
    : [
        {
          name: "Free",
          price: "S/ 0",
          desc: "Para crear tu perfil inicial.",
          features: ["Perfil freelancer", "Portafolio basico", "1 servicio recomendado", "Visibilidad estandar"],
          current: true,
        },
        {
          name: "Pro",
          price: "S/ 29",
          desc: "Para vender mejor tus servicios.",
          features: ["Servicios ilimitados", "Mas visibilidad", "IA Assistant ampliada", "Mentorias y mejoras de perfil"],
          current: false,
        },
      ];

  return (
    <DashboardShell role={role}>
      <div className="space-y-6">
        <div>
          <Badge className="bg-secondary/15 text-secondary">
            <Crown className="mr-1 h-3.5 w-3.5" />
            Planes
          </Badge>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-normal">Free y Pro</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Gestiona tu plan sin salir del dashboard. Por ahora estas en Free; Pro desbloquea mas capacidad cuando actives la suscripcion.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative rounded-2xl p-7 shadow-soft ${plan.current ? "border-secondary/40" : "border-primary/30"}`}>
              {!plan.current ? (
                <div className="absolute right-5 top-5">
                  <Badge className="bg-gradient-primary text-primary-foreground">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Pro
                  </Badge>
                </div>
              ) : null}
              <div className="font-display text-2xl font-bold">{plan.name}</div>
              <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-extrabold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">/ mes</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-secondary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className={`mt-7 w-full rounded-xl ${plan.current ? "" : "bg-gradient-primary shadow-soft"}`} variant={plan.current ? "outline" : "default"}>
                {plan.current ? "Plan actual" : "Activar Pro"}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
