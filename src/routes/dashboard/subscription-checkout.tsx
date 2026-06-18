import { Link, createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, CheckCircle2, CreditCard, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { getSessionUser, getToken, saveSession } from "@/lib/auth";

type CulqiCheckoutInstance = {
  open: () => void;
  close: () => void;
  token?: {
    id: string;
    email?: string;
  };
  error?: {
    user_message?: string;
    merchant_message?: string;
  };
  culqi?: () => void;
};

type Culqi3DSParameters = {
  eci?: string;
  xid?: string;
  cavv?: string;
  protocolVersion?: string;
  directoryServerTransactionId?: string;
};

type Culqi3DSInstance = {
  publicKey?: string;
  settings?: Record<string, unknown>;
  options?: Record<string, unknown>;
  generateDevice: () => Promise<string | null>;
  initAuthentication: (tokenId?: string) => Promise<void>;
  reset: () => void;
};

declare global {
  interface Window {
    CulqiCheckout?: new (publicKey: string, config: Record<string, unknown>) => CulqiCheckoutInstance;
    Culqi3DS?: Culqi3DSInstance;
  }
}

export const Route = createFileRoute("/dashboard/subscription-checkout")({
  head: () => ({ meta: [{ title: "Checkout SkillPro - SkilltoMoney" }] }),
  validateSearch: (search: Record<string, string | undefined>) => ({
    cycle: search.cycle === "yearly" ? "yearly" : "monthly",
  }),
  component: SubscriptionCheckoutPage,
});

type BillingCycle = "monthly" | "yearly";

const CULQI_PUBLIC_KEY = import.meta.env.VITE_CULQI_PUBLIC_KEY || "pk_test_6h2PtcfvP3UjXKyL";

function SubscriptionCheckoutPage() {
  const token = getToken();
  const user = getSessionUser();
  const navigate = useNavigate();
  const search = useSearch({ from: Route.id });
  const role = user?.account_type === "mype" ? "client" : "freelancer";
  const isMype = user?.account_type === "mype";
  const checkoutRef = useRef<CulqiCheckoutInstance | null>(null);
  const [cycle, setCycle] = useState<BillingCycle>(search.cycle);
  const [culqiReady, setCulqiReady] = useState(false);
  const [culqi3dsReady, setCulqi3dsReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const amount = cycle === "monthly"
    ? (isMype ? 49 : 29)
    : (isMype ? 490 : 290);
  const amountInCents = useMemo(() => Math.round(amount * 100), [amount]);
  const renewalText = cycle === "monthly" ? "Renovación mensual" : "Renovación anual";
  const monthlyPrice = isMype ? 49 : 29;
  const yearlyPrice = isMype ? 490 : 290;
  const savings = yearlyPrice - monthlyPrice * 12;
  const savingsText = cycle === "yearly"
    ? `Ahorra S/ ${Math.abs(savings)} frente al pago mensual.`
    : "Puedes cambiar a anual antes de pagar.";

  const completeCulqiPayment = useCallback(async (
    culqiToken: string,
    culqiEmail?: string,
    security?: {
      deviceFingerPrintId?: string | null;
      authentication3DS?: Culqi3DSParameters;
    },
  ) => {
    if (!token || !user) return;

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.checkoutSubscription(token, {
        plan: "pro",
        billing_cycle: cycle,
        payment_method: "card",
        save_payment_method: true,
        payment_details: {
          culqi_token: culqiToken,
          culqi_email: culqiEmail ?? user.email,
          device_finger_print_id: security?.deviceFingerPrintId ?? undefined,
          authentication_3ds: security?.authentication3DS,
        },
      });

      if (response.data) {
        saveSession(token, {
          ...user,
          subscription_plan: response.data.plan,
          subscription_status: response.data.status,
        });
        setSuccess(`Pago aprobado. Referencia: ${response.data.payment?.reference ?? "CULQI"}.`);
        setTimeout(() => void navigate({ to: "/dashboard/premium", search: { upgraded: "1" } }), 1200);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Culqi no pudo procesar el pago."));
    } finally {
      setProcessing(false);
    }
  }, [cycle, navigate, token, user]);

  const authenticateAndPay = useCallback(async (culqiToken: string, culqiEmail?: string) => {
    if (!user) return;

    if (!window.Culqi3DS) {
      await completeCulqiPayment(culqiToken, culqiEmail);
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const culqi3DS = window.Culqi3DS;
      culqi3DS.reset();
      culqi3DS.publicKey = CULQI_PUBLIC_KEY;
      culqi3DS.settings = {
        charge: {
          totalAmount: amountInCents,
          returnUrl: window.location.href,
          currency: "PEN",
        },
        card: {
          email: culqiEmail ?? user.email,
        },
      };
      culqi3DS.options = {
        showModal: true,
        showLoading: true,
        showIcon: true,
        style: {
          btnColor: "#FF4B36",
          btnTextColor: "#FFFFFF",
        },
      };

      const deviceFingerPrintId = await culqi3DS.generateDevice();
      const authentication3DS = await new Promise<Culqi3DSParameters>((resolve, reject) => {
        const timeout = window.setTimeout(() => {
          cleanup();
          reject(new Error("No se pudo completar la autenticacion 3DS. Intentalo nuevamente."));
        }, 120000);

        const cleanup = () => {
          window.clearTimeout(timeout);
          window.removeEventListener("message", handleMessage);
        };

        const handleMessage = (event: MessageEvent) => {
          const response = event.data as {
            loading?: boolean;
            parameters3DS?: Culqi3DSParameters;
            error?: string;
          } | null;

          if (!response || typeof response !== "object") return;

          if (response.loading) {
            setProcessing(true);
          }

          if (response.parameters3DS) {
            cleanup();
            resolve(response.parameters3DS);
          }

          if (response.error) {
            cleanup();
            reject(new Error(response.error));
          }
        };

        window.addEventListener("message", handleMessage);
        void culqi3DS.initAuthentication(culqiToken).catch((err: unknown) => {
          cleanup();
          reject(err instanceof Error ? err : new Error("No se pudo iniciar la autenticacion 3DS."));
        });
      });

      await completeCulqiPayment(culqiToken, culqiEmail, {
        deviceFingerPrintId,
        authentication3DS,
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo autenticar el pago con 3DS."));
      setProcessing(false);
    }
  }, [amountInCents, completeCulqiPayment, user]);

  useEffect(() => {
    if (!CULQI_PUBLIC_KEY) {
      setError("Falta configurar VITE_CULQI_PUBLIC_KEY en el frontend.");
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://js.culqi.com/checkout-js"]');

    const markReady = () => setCulqiReady(Boolean(window.CulqiCheckout));

    if (existing) {
      markReady();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.culqi.com/checkout-js";
    script.async = true;
    script.onload = markReady;
    script.onerror = () => setError("No se pudo cargar Culqi Custom Checkout. Revisa tu conexión o la llave pública.");
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!CULQI_PUBLIC_KEY) return;

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://3ds.culqi.com"]');

    const markReady = () => {
      if (window.Culqi3DS) {
        window.Culqi3DS.publicKey = CULQI_PUBLIC_KEY;
      }
      setCulqi3dsReady(Boolean(window.Culqi3DS));
    };

    if (existing) {
      markReady();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://3ds.culqi.com";
    script.async = true;
    script.onload = markReady;
    script.onerror = () => setError("No se pudo cargar Culqi3DS. Revisa tu conexion o prueba nuevamente.");
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!culqiReady || !window.CulqiCheckout || !user) return;

    const embeddedContainer = document.querySelector<HTMLElement>("#culqi-embedded-container");
    if (embeddedContainer) {
      embeddedContainer.innerHTML = "";
    }

    const paymentMethods = {
      tarjeta: true,
      yape: false,
      billetera: false,
      bancaMovil: false,
      agente: false,
      cuotealo: false,
    };

    const config = {
      settings: {
        title: "Skill to Money",
        currency: "PEN",
        amount: amountInCents,
      },
      client: {
        email: user.email,
      },
      options: {
        lang: "es",
        modal: false,
        container: "#culqi-embedded-container",
        installments: false,
        paymentMethods,
        paymentMethodsSort: ["tarjeta"],
      },
      appearance: {
        theme: "default",
        hiddenCulqiLogo: false,
        hiddenBanner: true,
        hiddenBannerContent: true,
        hiddenToolBarAmount: true,
        menuType: "select",
        buttonCardPayText: "Pagar",
        defaultStyle: {
          bannerColor: "#00C9BA",
          buttonBackground: "#FF4B36",
          menuColor: "#00C9BA",
          linksColor: "#00AFA3",
          buttonTextColor: "#FFFFFF",
          priceColor: "#061113",
        },
        variables: {
          fontFamily: "Inter, ui-sans-serif, system-ui",
          borderRadius: "12px",
          colorBackground: "#FFFFFF",
          colorText: "#061113",
        },
        rules: {
          ".Culqi-Button": {
            "border-radius": "12px",
            "font-weight": "800",
          },
          ".Culqi-Input": {
            "border-radius": "12px",
          },
        },
      },
    };

    const checkout = new window.CulqiCheckout(CULQI_PUBLIC_KEY, config);
    checkout.culqi = () => {
      if (checkout.token?.id) {
        const culqiToken = checkout.token.id;
        const culqiEmail = checkout.token.email;
        checkout.close();
        void authenticateAndPay(culqiToken, culqiEmail);
        return;
      }

      const message = checkout.error?.user_message
        ?? checkout.error?.merchant_message
        ?? "No se pudo generar el token de Culqi.";
      setError(message);
      setProcessing(false);
    };

    checkoutRef.current = checkout;

    const timer = window.setTimeout(() => {
      checkout.open();
    }, 100);

    return () => window.clearTimeout(timer);
  }, [amount, amountInCents, authenticateAndPay, culqiReady, user]);

  const reloadEmbeddedCheckout = () => {
    setError(null);
    setSuccess(null);
    checkoutRef.current?.open();
  };

  return (
    <DashboardShell role={role}>
      <div className="mx-auto max-w-6xl space-y-6">
        <style>
          {`
            #culqi-embedded-container iframe {
              width: 100% !important;
              min-height: 600px !important;
              height: 600px !important;
              border: 0 !important;
            }

            #culqi-embedded-container > * {
              max-width: 100% !important;
            }
          `}
        </style>

        <Link to="/dashboard/premium" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Volver a planes
        </Link>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="rounded-2xl p-0 shadow-soft">
            <div className="border-b border-border bg-card px-7 py-6">
              <Badge className="bg-secondary/15 text-secondary">
                <LockKeyhole className="mr-1 h-3.5 w-3.5" />
                Checkout seguro
              </Badge>
              <h1 className="mt-3 font-display text-3xl font-extrabold tracking-normal">Mejorar plan</h1>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Activa SkillPro con tarjeta mediante Culqi. Tus datos de pago se procesan en la pasarela, no en Skill to Money.
              </p>
            </div>

            <div className="px-7 py-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <BillingButton
                  active={cycle === "monthly"}
                  label="Mensual"
                  price={isMype ? "S/ 49" : "S/ 29"}
                  detail="Pago cada mes"
                  onClick={() => setCycle("monthly")}
                />
                <BillingButton
                  active={cycle === "yearly"}
                  label="Anual"
                  price={isMype ? "S/ 490" : "S/ 290"}
                  detail="Mejor valor"
                  onClick={() => setCycle("yearly")}
                />
              </div>

              {error ? <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}
              {success ? <div className="mt-5 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary">{success}</div> : null}

              <div className="mt-6 rounded-2xl border border-border bg-background p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-display text-lg font-bold">
                      <CreditCard className="h-5 w-5 text-secondary" />
                      Tarjeta de débito o crédito
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Formulario embebido de Culqi Custom Checkout.
                    </p>
                  </div>
                  <Badge variant="outline">Powered by Culqi</Badge>
                </div>

                <div
                  id="culqi-embedded-container"
                  className="min-h-[600px] overflow-visible rounded-xl border border-border bg-white"
                >
                  {!culqiReady || !culqi3dsReady ? (
                    <div className="grid min-h-[600px] place-items-center text-center">
                      <div>
                        <Loader2 className="mx-auto h-7 w-7 animate-spin text-muted-foreground" />
                        <p className="mt-3 text-sm text-muted-foreground">Cargando pasarela segura...</p>
                      </div>
                    </div>
                  ) : null}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={reloadEmbeddedCheckout}
                  disabled={!culqiReady || processing}
                  className="mt-4 w-full rounded-xl"
                >
                  {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                  Recargar formulario de pago
                </Button>
              </div>
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="rounded-2xl p-6 shadow-soft">
              <div className="flex items-center gap-2 font-display text-2xl font-bold">
                <BadgeCheck className="h-6 w-6 text-secondary" />
                Resumen del pedido
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-muted/20 p-5">
                <div className="text-sm font-semibold text-muted-foreground">SkillPro</div>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <div>
                    <div className="font-display text-4xl font-extrabold">S/ {amount}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{renewalText}</div>
                  </div>
                  <Badge className="bg-secondary/15 text-secondary">{cycle === "monthly" ? "Mensual" : "Anual"}</Badge>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{savingsText}</p>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <SummaryRow label="Subtotal" value={`S/ ${amount}`} />
                <SummaryRow label="Impuestos" value="Incluidos" />
                <SummaryRow label="Total a pagar" value={`S/ ${amount}`} strong />
              </div>
            </Card>

            <Card className="rounded-2xl p-6 shadow-soft">
              <h2 className="font-display text-xl font-bold">Incluye</h2>
              <div className="mt-4 space-y-3 text-sm">
                {[
                  "Mayor visibilidad en búsquedas",
                  "Más publicaciones y servicios activos",
                  "Acceso ampliado a Skill Bot",
                  "Mejor posicionamiento del perfil",
                  "Funciones de crecimiento para MYPE y freelancer",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-secondary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function BillingButton({
  active,
  label,
  price,
  detail,
  onClick,
}: {
  active: boolean;
  label: string;
  price: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active ? "border-primary bg-primary/10 shadow-soft" : "border-border bg-muted/20 hover:bg-muted/40"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-lg font-bold">{label}</span>
        <span className="font-display text-2xl font-extrabold">{price}</span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
    </button>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 border-t border-border pt-3 ${strong ? "font-display text-lg font-bold" : ""}`}>
      <span className={strong ? "text-foreground" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message ?? fallback);
  }

  return fallback;
}
