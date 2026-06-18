import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Crown,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { api, type SubscriptionPayload } from "@/lib/api";
import { getSessionUser, getToken, saveSession } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/premium")({
  head: () => ({ meta: [{ title: "SkillPro - SkilltoMoney" }] }),
  component: DashboardPremiumPage,
});

type BillingCycle = "monthly" | "yearly";

const mypeFreeFeatures = ["1 publicación activa", "Buscar freelancers", "Guardar favoritos", "Explorar servicios"];
const freelancerFreeFeatures = ["Perfil freelancer", "Portafolio básico", "1 servicio recomendado", "Visibilidad estándar"];

const mypeProFeatures = [
  "Publicaciones ilimitadas",
  "Mayor visibilidad para tus proyectos",
  "Recomendaciones avanzadas de freelancers",
  "Soporte prioritario",
];

const freelancerProFeatures = [
  "Servicios ilimitados",
  "Más visibilidad en el marketplace",
  "Skill Bot ampliado",
  "Analítica de perfil",
];

const mypeUpgradeChanges = [
  "Puedes publicar más de un proyecto activo.",
  "Tus proyectos se muestran con mayor prioridad.",
  "Accedes a recomendaciones más completas de freelancers compatibles.",
  "Mantienes búsqueda, favoritos, servicios y contacto con talento.",
];

const freelancerUpgradeChanges = [
  "Puedes publicar más servicios sin quedar limitado al plan Free.",
  "Tu perfil gana mayor visibilidad frente a MYPES.",
  "Skill Bot puede ayudarte con mejoras más completas.",
  "Accedes a analítica para entender el rendimiento de tu perfil.",
];

function DashboardPremiumPage() {
  const token = getToken();
  const user = getSessionUser();
  const role = user?.account_type === "mype" ? "client" : "freelancer";
  const isMype = user?.account_type === "mype";
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [subscription, setSubscription] = useState<SubscriptionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPro = subscription?.plan === "pro" || user?.subscription_plan === "pro";
  const proPrice = cycle === "monthly" ? "S/ 29" : "S/ 290";
  const freeFeatures = isMype ? mypeFreeFeatures : freelancerFreeFeatures;
  const proFeatures = isMype ? mypeProFeatures : freelancerProFeatures;
  const upgradeChanges = isMype ? mypeUpgradeChanges : freelancerUpgradeChanges;

  const currentFeatures = useMemo(() => {
    if (subscription?.features?.length) return subscription.features;
    return isPro ? proFeatures : freeFeatures;
  }, [freeFeatures, isPro, proFeatures, subscription?.features]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api.getSubscription(token)
      .then((response) => {
        setSubscription(response.data);
        if (user) {
          saveSession(token, {
            ...user,
            subscription_plan: response.data.plan,
            subscription_status: response.data.status,
          });
        }
      })
      .catch(() => setError("No se pudo cargar tu suscripción."))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <DashboardShell role={role}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="bg-secondary/15 text-secondary">
              <Crown className="mr-1 h-3.5 w-3.5" />
              Suscripción
            </Badge>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-normal">Elige tu SkillPro</h1>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              Compara tu plan Free con Pro. Cuando el pago se aprueba, tu cuenta cambia automáticamente a Pro.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-1 shadow-soft">
            <button
              type="button"
              onClick={() => setCycle("monthly")}
              className={`rounded-xl px-5 py-2 text-sm font-bold transition ${cycle === "monthly" ? "bg-gradient-primary text-primary-foreground shadow-soft" : "text-muted-foreground"}`}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => setCycle("yearly")}
              className={`rounded-xl px-5 py-2 text-sm font-bold transition ${cycle === "yearly" ? "bg-gradient-primary text-primary-foreground shadow-soft" : "text-muted-foreground"}`}
            >
              Anual
            </button>
          </div>
        </div>

        {error ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}

        <Card className={`overflow-hidden rounded-2xl p-0 shadow-soft ${isPro ? "border-secondary/40" : "border-border"}`}>
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className={isPro ? "bg-secondary/12 p-6" : "bg-muted/30 p-6"}>
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                {isPro ? <BadgeCheck className="h-4 w-4 text-secondary" /> : <Crown className="h-4 w-4 text-primary" />}
                Estado actual de tu cuenta
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <span className="font-display text-4xl font-extrabold">{isPro ? "SkillPro activo" : "Plan Free"}</span>
                <Badge className={isPro ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}>
                  {isPro ? "Pagado" : "Sin pago activo"}
                </Badge>
              </div>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                {isPro
                  ? "Tu cuenta ya tiene las funciones Pro habilitadas. El dashboard y los límites se comportan según este plan."
                  : "Tu cuenta sigue en Free. Puedes usar las funciones base y subir a Pro cuando quieras ampliar tus límites."}
              </p>

              {isPro && subscription?.last_payment ? (
                <div className="mt-5 rounded-xl border border-secondary/25 bg-background/70 p-4 text-sm">
                  <div className="font-semibold text-foreground">Último pago confirmado</div>
                  <p className="mt-1 text-muted-foreground">
                    Referencia: {subscription.last_payment.reference}. Renovación: {subscription.ends_at ? formatDate(subscription.ends_at) : "sin fecha registrada"}.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 text-sm font-bold">
                <TrendingUp className="h-4 w-4 text-secondary" />
                Funciones disponibles ahora
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {currentFeatures.map((feature) => (
                  <div key={feature} className="flex gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <PlanCard
            name="Free"
            price="S/ 0"
            period="siempre"
            description={isMype ? "Para probar la búsqueda de talento." : "Para crear tu perfil inicial."}
            features={freeFeatures}
            active={!isPro}
            cta={isPro ? "Disponible" : "Plan actual"}
          />

          <PlanCard
            name="Pro"
            price={proPrice}
            period={cycle === "monthly" ? "mes" : "año"}
            description={isMype ? "Para contratar con más velocidad." : "Para vender mejor tus servicios."}
            features={proFeatures}
            active={isPro}
            highlight
            cta={isPro ? "Plan activo" : "Mejorar plan"}
            cycle={cycle}
            disabled={loading || isPro}
          />
        </div>

        {!isPro ? (
          <Card className="rounded-2xl border-secondary/30 bg-secondary/10 p-5 shadow-soft">
            <div className="flex items-center gap-2 font-display text-lg font-bold">
              <Sparkles className="h-5 w-5 text-secondary" />
              ¿Qué cambia cuando pasas de Free a Pro?
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {upgradeChanges.map((change) => (
                <div key={change} className="flex gap-2 rounded-xl bg-background/70 p-3 text-sm">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{change}</span>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="rounded-2xl border-secondary/30 bg-secondary/10 p-5 shadow-soft">
            <div className="flex items-center gap-2 font-display text-lg font-bold text-secondary">
              <BadgeCheck className="h-5 w-5" />
              Cambio aplicado correctamente
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Tu usuario pasó de Free a Pro. Las funciones Pro ya se muestran como activas en el dashboard.
            </p>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground shadow-soft">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando estado de suscripción...
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}

function PlanCard({
  name,
  price,
  period,
  description,
  features,
  active,
  cta,
  highlight = false,
  disabled = false,
  cycle = "monthly",
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  active: boolean;
  cta: string;
  highlight?: boolean;
  disabled?: boolean;
  cycle?: BillingCycle;
}) {
  const buttonClass = `mt-7 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold transition ${
    highlight && !disabled
      ? "bg-gradient-primary text-primary-foreground shadow-soft hover:opacity-95"
      : "border border-border bg-card text-muted-foreground"
  }`;

  return (
    <Card className={`relative rounded-2xl p-7 shadow-soft ${highlight ? "border-primary/40" : "border-secondary/30"} ${active ? "ring-2 ring-secondary/25" : ""}`}>
      {highlight ? (
        <div className="absolute right-5 top-5">
          <Badge className="bg-gradient-primary text-primary-foreground">
            <Sparkles className="mr-1 h-3 w-3" />
            Recomendado
          </Badge>
        </div>
      ) : null}

      <div className="font-display text-2xl font-bold">{name}</div>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 flex items-baseline gap-1">
        <span className="font-display text-5xl font-extrabold">{price}</span>
        <span className="text-sm text-muted-foreground">/ {period}</span>
      </div>
      <ul className="mt-6 space-y-3 text-sm">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-secondary" />
            {feature}
          </li>
        ))}
      </ul>

      {highlight && !active ? (
        <Link to="/dashboard/subscription-checkout" search={{ cycle }} className={buttonClass}>
          {cta}
        </Link>
      ) : (
        <button type="button" disabled className={buttonClass}>
          {active ? "Plan actual" : cta}
        </button>
      )}
    </Card>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
