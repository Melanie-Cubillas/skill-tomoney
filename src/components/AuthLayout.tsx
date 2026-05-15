import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-hero p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur"><Sparkles className="h-4 w-4" /></span>
          SkilltoMoney
        </Link>
        <div>
          <h2 className="font-display text-4xl font-extrabold leading-tight">Tu próximo cliente está a un click.</h2>
          <p className="mt-4 max-w-md text-primary-foreground/80">Únete a la comunidad de freelancers digitales que ya están vendiendo sus skills.</p>
          <div className="mt-8 flex -space-x-2">
            {["CR","DS","LF","MQ","SM"].map(a=>(<div key={a} className="grid h-10 w-10 place-items-center rounded-full border-2 border-white/40 bg-white/15 text-sm font-semibold backdrop-blur">{a}</div>))}
          </div>
        </div>
        <div className="text-xs text-primary-foreground/60">© 2026 SkilltoMoney</div>
      </div>
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2 font-display text-lg font-bold lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></span>
            SkilltoMoney
          </Link>
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
