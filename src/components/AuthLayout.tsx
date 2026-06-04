import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  asideEyebrow?: string;
  asideTitle?: string;
  asideSubtitle?: string;
  asideStats?: Array<[string, string]>;
};

const defaultStats: Array<[string, string]> = [["+3.2k", "oportunidades"], ["4.9", "rating"], ["24/7", "soporte"]];

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  asideEyebrow = "Beta abierta",
  asideTitle = "Tu próximo cliente está a un clic.",
  asideSubtitle = "Únete a freelancers y MYPES que ya están construyendo oportunidades reales con talento digital.",
  asideStats = defaultStats,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-hero text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute inset-0 noise opacity-[0.04]" />
        <div className="absolute right-10 top-20 h-32 w-24 dot-field opacity-45" />
        <Link to="/" className="relative flex w-fit items-center" aria-label="Skill-to-Money inicio">
          <img src="/brand/skill-to-money-logo-white.png" alt="Skill-to-Money" className="h-auto w-[190px] object-contain" />
        </Link>
        <div className="relative max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-bold backdrop-blur">
            <Sparkles className="h-3 w-3 text-accent" /> {asideEyebrow}
          </div>
          <h2 className="mt-5 font-display text-4xl font-extrabold leading-tight">
            {asideTitle}
          </h2>
          <p className="mt-4 text-white/72">
            {asideSubtitle}
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {asideStats.map(([a, b]) => (
              <div key={a} className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                <div className="font-display text-lg font-bold">{a}</div>
                <div className="text-[11px] uppercase tracking-wide text-white/60">{b}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-white/50">
          MVP universitario · Hecho con dedicación en Perú
        </div>
      </div>
      <div className="flex flex-col bg-background">
        <div className="flex justify-end p-6 lg:hidden">
          <Link to="/" className="font-display text-sm font-bold">
            SkilltoMoney
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <h1 className="font-display text-3xl font-bold">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
