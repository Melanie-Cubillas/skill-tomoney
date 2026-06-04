import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Building2, CheckCircle2, Eye, EyeOff, Search, Loader2 } from "lucide-react";
import { api, type DniLookupPayload, type RucLookupPayload } from "@/lib/api";
import { saveSession } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Crear cuenta · Skill-to-Money" }, { name: "description", content: "Crea tu cuenta en Skill-to-Money en menos de 2 minutos." }] }),
  component: Register,
});

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 10;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 20;
  if (/\d/.test(password)) score += 20;
  if (/[^a-zA-Z0-9]/.test(password)) score += 25;

  if (score <= 25) return { score, label: "Débil", color: "bg-red-500" };
  if (score <= 50) return { score, label: "Regular", color: "bg-orange-500" };
  if (score <= 75) return { score, label: "Buena", color: "bg-yellow-500" };
  return { score, label: "Segura", color: "bg-green-500" };
}

function normalizePasswordTerm(value: string): string {
  return value.trim().toLowerCase();
}

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"freelancer" | "mype">("freelancer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [dni, setDni] = useState("");
  const [ruc, setRuc] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aside = useMemo(() => role === "freelancer"
    ? {
        eyebrow: "Para freelancers",
        title: "Convierte tus skills en oportunidades reales.",
        subtitle: "Crea tu perfil, recibe recomendaciones personalizadas y conecta con MYPES que necesitan talento digital.",
        stats: [["+3.2k", "oportunidades"], ["IA", "recomendaciones"], ["0%", "comision inicial"]] as Array<[string, string]>,
      }
    : {
        eyebrow: "Para MYPES",
        title: "Encuentra talento digital confiable para tu negocio.",
        subtitle: "Registra tu MYPE, explora freelancers verificados y empieza a publicar oportunidades.",
        stats: [["+3.2k", "oportunidades"], ["24/7", "soporte"], ["match", "recomendado"]] as Array<[string, string]>,
      }, [role]);
  const [lookingUp, setLookingUp] = useState(false);
  const [dniLookedUp, setDniLookedUp] = useState(false);
  const [rucLookedUp, setRucLookedUp] = useState(false);
  const [rucState, setRucState] = useState<string | null>(null);
  const [rucCondition, setRucCondition] = useState<string | null>(null);

  const strength = getPasswordStrength(password);
  const personalTerms = [firstName, lastName, companyName, email.split("@")[0], dni, ruc]
    .map(normalizePasswordTerm)
    .filter((term) => term.length >= 3);
  const normalizedPassword = password.toLowerCase();
  const usesPersonalInfo = personalTerms.some((term) => normalizedPassword.includes(term));
  const passwordRequirements = [
    { label: "Mínimo 8 caracteres", met: password.length >= 8 },
    { label: "Incluye una letra mayúscula", met: /[A-Z]/.test(password) },
    { label: "Incluye un número", met: /\d/.test(password) },
    { label: "Incluye un símbolo", met: /[^a-zA-Z0-9]/.test(password) },
    { label: "No uses tu nombre, apellido, correo, DNI, RUC o empresa", met: !usesPersonalInfo },
  ];
  const isPasswordValid = passwordRequirements.every((requirement) => requirement.met);
  const needsDniValidation = role === "freelancer" && !dniLookedUp;
  const needsRucValidation = role === "client" && !rucLookedUp;
  const needsIdentityValidation = needsDniValidation || needsRucValidation;

  const handleDniLookup = useCallback(async () => {
    if (dni.length !== 8 || lookingUp) return;
    setLookingUp(true);
    setError(null);
    try {
      const res = await api.lookupDni(dni);
      const data = res.data as DniLookupPayload;
      setFirstName(data.first_name);
      setLastName(data.last_name);
      setDniLookedUp(true);
    } catch (err: unknown) {
      const payload = err as { message?: string };
      setError(payload?.message ?? "No se pudo validar el DNI.");
    } finally {
      setLookingUp(false);
    }
  }, [dni, lookingUp]);

  const handleRucLookup = useCallback(async () => {
    if (ruc.length !== 11 || lookingUp) return;
    setLookingUp(true);
    setError(null);
    try {
      const res = await api.lookupRuc(ruc);
      const data = res.data as RucLookupPayload;
      setCompanyName(data.business_name);
      setRucState(data.state);
      setRucCondition(data.condition);
      setRucLookedUp(true);
    } catch (err: unknown) {
      const payload = err as { message?: string };
      setError(payload?.message ?? "No se pudo validar el RUC.");
    } finally {
      setLookingUp(false);
    }
  }, [ruc, lookingUp]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (role === "freelancer" && !dniLookedUp) {
      setError("Primero valida tu DNI para continuar con el registro.");
      return;
    }
    if (role === "client" && !rucLookedUp) {
      setError("Primero valida tu RUC para continuar con el registro.");
      return;
    }
    if (!isPasswordValid) {
      setError("Completa los requisitos de la contraseña antes de crear la cuenta.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response =
        role === "freelancer"
          ? await api.registerFreelancer({
              first_name: firstName,
              last_name: lastName,
              dni,
              email,
              password,
            })
          : await api.registerMype({
              company_name: companyName || undefined,
              ruc,
              email,
              password,
            });

      if (!response.data) {
        throw new Error("No se recibió sesión.");
      }

      saveSession(response.data.access_token, response.data.user);
      navigate({ to: role === "freelancer" ? "/dashboard/freelancer" : "/dashboard/client" });
    } catch (err: unknown) {
      const payload = err as { message?: string; errors?: Record<string, string[]> };
      const firstError = Object.values(payload?.errors ?? {})[0]?.[0];
      setError(firstError ?? payload?.message ?? "No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={role === "freelancer" ? "Crea tu perfil freelancer" : "Registra tu MYPE"}
      subtitle={
        role === "freelancer"
          ? "Completa tus datos para empezar a vender tus skills."
          : "Valida tu RUC y registra tu empresa en minutos."
      }
      asideEyebrow={aside.eyebrow}
      asideTitle={aside.title}
      asideSubtitle={aside.subtitle}
      asideStats={aside.stats}
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <div className="mb-6 rounded-2xl border border-border bg-muted/30 p-2 shadow-soft">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { v: "freelancer", l: "Freelancer", i: Briefcase },
              { v: "mype", l: "MYPE / Cliente", i: Building2 },
            ] as const
          ).map((option) => (
            <button
              key={option.v}
              type="button"
              onClick={() => {
                setRole(option.v);
                setError(null);
                setDniLookedUp(false);
                setRucLookedUp(false);
                setRucState(null);
                setRucCondition(null);
                setDni("");
                setRuc("");
                setFirstName("");
                setLastName("");
                setCompanyName("");
              }}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                role === option.v
                  ? "border-[#00C9BA] bg-background text-foreground shadow-soft"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
              aria-pressed={role === option.v}
            >
              <option.i className="h-4 w-4" />
              {option.l}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-start gap-3 rounded-xl border border-[#00C9BA]/40 bg-[#00C9BA]/10 px-4 py-3 text-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00C9BA]" />
          <div>
            <p className="font-semibold text-foreground">
              {role === "freelancer" ? "Registro para freelancer" : "Registro para MYPE o cliente"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {role === "freelancer"
                ? "Ingresa tu DNI y presiona Enter para buscar tus datos automáticamente."
                : "Ingresa tu RUC y presiona Enter para validar y completar tus datos."}
            </p>
          </div>
        </div>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        {role === "freelancer" ? (
          <>
            <div className="space-y-1.5">
              <Label>DNI</Label>
              <div className="relative">
                <Input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={8}
                  placeholder="8 dígitos"
                  value={dni}
                  onChange={(e) => {
                    setDni(e.target.value.replace(/\D/g, "").slice(0, 8));
                    setDniLookedUp(false);
                    setFirstName("");
                    setLastName("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && dni.length === 8) {
                      e.preventDefault();
                      handleDniLookup();
                    }
                  }}
                  required
                  disabled={lookingUp}
                />
                {dni.length === 8 && !lookingUp && !dniLookedUp && (
                  <button
                    type="button"
                    onClick={handleDniLookup}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                )}
                {lookingUp && (
                  <Loader2 className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nombre</Label>
                <Input
                  placeholder={dniLookedUp ? "Camila" : "Valida tu DNI primero"}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Apellido</Label>
                <Input
                  placeholder={dniLookedUp ? "Rojas" : "Valida tu DNI primero"}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled
                  className="bg-muted/50"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label>RUC</Label>
              <div className="relative">
                <Input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={11}
                  placeholder="11 dígitos"
                  value={ruc}
                  onChange={(e) => {
                    setRuc(e.target.value.replace(/\D/g, "").slice(0, 11));
                    setRucLookedUp(false);
                    setCompanyName("");
                    setRucState(null);
                    setRucCondition(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && ruc.length === 11) {
                      e.preventDefault();
                      handleRucLookup();
                    }
                  }}
                  required
                  disabled={lookingUp}
                />
                {ruc.length === 11 && !lookingUp && !rucLookedUp && (
                  <button
                    type="button"
                    onClick={handleRucLookup}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                )}
                {lookingUp && (
                  <Loader2 className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Razón Social</Label>
              <Input
                placeholder={rucLookedUp ? "Lumen Café E.I.R.L." : "Valida tu RUC primero"}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled
                className="bg-muted/50"
              />
            </div>

            {rucLookedUp && rucState && rucCondition && (
              <div className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm bg-muted/30 border-border">
                <div className="flex flex-wrap gap-3">
                  <span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${rucCondition === "HABIDO" ? "bg-green-500" : "bg-red-500"}`}
                    />
                    {rucCondition}
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${rucState === "ACTIVO" ? "bg-green-500" : "bg-red-500"}`}
                    />
                    {rucState}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        <div className="space-y-1.5">
          <Label>Correo electrónico</Label>
          <Input
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={needsIdentityValidation}
            className={needsIdentityValidation ? "bg-muted/50" : ""}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Contraseña</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={needsIdentityValidation}
              className={`pr-10 ${needsIdentityValidation ? "bg-muted/50" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              disabled={needsIdentityValidation}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
                  <div
                    className={`h-full transition-all ${strength.color}`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
                <span className={`text-xs font-semibold ${strength.color.replace("bg-", "text-")}`}>
                  {strength.label}
                </span>
              </div>
              <div className="space-y-1 rounded-xl border border-border bg-muted/30 px-3 py-2">
                {passwordRequirements.map((requirement) => (
                  <p
                    key={requirement.label}
                    className={`flex items-center gap-2 text-xs ${
                      requirement.met ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    {requirement.met
                      ? requirement.label
                      : `Falta: ${requirement.label.toLowerCase()}`}
                  </p>
                ))}
              </div>
            </div>
          )}
          {needsIdentityValidation && (
            <p className="text-xs text-muted-foreground">
              {role === "freelancer"
                ? "Valida tu DNI para habilitar el correo y la contraseña."
                : "Valida tu RUC para habilitar el correo y la contraseña."}
            </p>
          )}
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button
          className="w-full bg-gradient-primary shadow-soft"
          size="lg"
          type="submit"
          disabled={loading || lookingUp || needsIdentityValidation || !isPasswordValid}
        >
          {loading ? "Creando..." : "Crear cuenta gratis"}
        </Button>

        {role === "freelancer" && !dniLookedUp && dni.length > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            Presiona Enter o el botón de buscar para validar tu DNI primero.
          </p>
        )}
        {role === "client" && !rucLookedUp && ruc.length > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            Presiona Enter o el botón de buscar para validar tu RUC primero.
          </p>
        )}
      </form>
    </AuthLayout>
  );
}
