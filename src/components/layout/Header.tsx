import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <span className="font-display text-sm font-bold text-primary-foreground">S</span>
            <span className="absolute -inset-0.5 -z-10 rounded-xl bg-gradient-primary opacity-50 blur-md transition group-hover:opacity-80" />
          </span>
          <span className="font-display text-base font-bold tracking-tight">
            Skill<span className="text-gradient">to</span>Money
          </span>
        </Link>
        <nav className="hidden items-center gap-1 rounded-full border border-border/60 bg-card/60 px-1.5 py-1.5 text-sm font-medium md:flex">
          {[
            { to: "/services", label: "Servicios" },
            { to: "/talent", label: "Talento" },
            { to: "/premium", label: "Mentorías" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-3.5 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              activeProps={{ className: "rounded-full px-3.5 py-1.5 bg-foreground/5 text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link to="/login">Iniciar sesión</Link>
          </Button>
          <Button size="sm" asChild className="bg-gradient-primary text-primary-foreground shadow-soft hover:opacity-95">
            <Link to="/register">Empieza gratis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
