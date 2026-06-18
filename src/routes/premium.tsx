import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Crown, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/premium")({
  head: () => ({
    meta: [
      { title: "SkillPro · SkilltoMoney" },
      { name: "description", content: "Activa SkillPro para tener más visibilidad, límites ampliados y mejores herramientas." },
    ],
  }),
  component: () => (
    <Shell>
      <section className="relative overflow-hidden bg-gradient-hero py-20 text-primary-foreground">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <Badge className="bg-white/15 text-primary-foreground backdrop-blur">
            <Crown className="mr-1 h-3 w-3" />
            SkillPro
          </Badge>
          <h1 className="mt-4 font-display text-5xl font-bold">Más alcance para vender y contratar mejor</h1>
          <p className="mt-4 text-white/75">
            Amplía tus límites, mejora tu visibilidad y trabaja con herramientas pensadas para el marketplace.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <PlanCard
            name="Free"
            price="S/ 0"
            description="Para empezar a probar SkilltoMoney."
            cta="Crear cuenta gratis"
            features={["Perfil básico", "1 publicación o servicio inicial", "Chat con usuarios", "Pagos protegidos"]}
          />
          <PlanCard
            name="SkillPro"
            price="S/ 29"
            description="Para crecer con más límites y mejor posicionamiento."
            cta="Ver SkillPro"
            highlight
            features={["Servicios o publicaciones ampliadas", "Mayor visibilidad", "Skill Bot ampliado", "Analítica de perfil"]}
          />
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          <Benefit icon={TrendingUp} title="Mejor visibilidad" text="Tu perfil o proyecto puede destacar más dentro del marketplace." />
          <Benefit icon={Sparkles} title="Skill Bot ampliado" text="Más apoyo para mejorar perfil, servicios y presentación." />
          <Benefit icon={ShieldCheck} title="Pagos protegidos" text="Compatible con el flujo de pagos protegidos de la plataforma." />
        </div>
      </section>
    </Shell>
  ),
});

function PlanCard({
  name,
  price,
  description,
  cta,
  features,
  highlight = false,
}: {
  name: string;
  price: string;
  description: string;
  cta: string;
  features: string[];
  highlight?: boolean;
}) {
  return (
    <Card className={`relative overflow-hidden p-8 ${highlight ? "border-primary/40 shadow-glow" : "shadow-soft"}`}>
      {highlight ? (
        <div className="absolute right-4 top-4">
          <Badge className="bg-gradient-primary text-primary-foreground">
            <Sparkles className="mr-1 h-3 w-3" />
            Recomendado
          </Badge>
        </div>
      ) : null}
      <div className="font-display text-lg font-semibold">{name}</div>
      <div className="mt-1 text-xs text-muted-foreground">{description}</div>
      <div className="mt-5 flex items-baseline gap-1">
        <span className="font-display text-5xl font-bold">{price}</span>
        <span className="text-sm text-muted-foreground">/ mes</span>
      </div>
      <ul className="mt-6 space-y-2.5 text-sm">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
            {feature}
          </li>
        ))}
      </ul>
      <Button className={`mt-7 w-full ${highlight ? "bg-gradient-primary shadow-soft" : ""}`} variant={highlight ? "default" : "outline"} asChild>
        <Link to="/register">{cta}</Link>
      </Button>
    </Card>
  );
}

function Benefit({ icon: Icon, title, text }: { icon: typeof TrendingUp; title: string; text: string }) {
  return (
    <Card className="p-6 shadow-soft">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary/15 text-secondary">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-4 font-display text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </Card>
  );
}
