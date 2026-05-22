import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-hero text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute inset-0 noise opacity-[0.04]" />
        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <span className="font-display text-sm font-bold">S</span>
          </span>
          <span className="font-display text-base font-bold">SkilltoMoney</span>
        </Link>
        <div className="relative max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs backdrop-blur">
            <Sparkles className="h-3 w-3" /> Beta abierta · 100% gratis
          </div>
          <h2 className="mt-5 font-display text-4xl font-bold leading-tight">
            Tu próximo cliente está a un clic.
          </h2>
          <p className="mt-4 text-white/70">
            Únete a +1,200 freelancers y +380 MYPES que ya están construyendo juntos en SkilltoMoney.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[["+2.1k","proyectos"],["4.9★","rating"],["S/ 320","ingreso prom."]].map(([a,b])=>(
              <div key={a} className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                <div className="font-display text-lg font-bold">{a}</div>
                <div className="text-[11px] uppercase tracking-wide text-white/60">{b}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-white/50">MVP universitario · Hecho con 💜 en Perú</div>
      </div>
      <div className="flex flex-col bg-background">
        <div className="flex justify-end p-6 lg:hidden">
          <Link to="/" className="font-display text-sm font-bold">SkilltoMoney</Link>
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
