import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
            <Sparkles className="h-4 w-4" />
          </span>
          <span>Skill<span className="text-gradient">to</span>Money</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <Link to="/services" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Servicios</Link>
          <Link to="/talent" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Talento</Link>
          <Link to="/premium" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Mentorías</Link>
          <Link to="/dashboard/freelancer" className="hover:text-foreground transition-colors">Soy Freelancer</Link>
          <Link to="/dashboard/client" className="hover:text-foreground transition-colors">Soy Cliente</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link to="/login">Iniciar sesión</Link>
          </Button>
          <Button size="sm" asChild className="bg-gradient-primary hover:opacity-95 shadow-soft">
            <Link to="/register">Empieza gratis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
