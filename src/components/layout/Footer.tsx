import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary"><Sparkles className="h-4 w-4" /></span>
            SkilltoMoney
          </div>
          <p className="mt-3 text-sm text-secondary-foreground/70">Convierte tus habilidades digitales en ingresos reales.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Plataforma</h4>
          <ul className="mt-3 space-y-2 text-sm text-secondary-foreground/70">
            <li><Link to="/services">Marketplace</Link></li>
            <li><Link to="/talent">Buscar talento</Link></li>
            <li><Link to="/premium">Mentorías</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Cuenta</h4>
          <ul className="mt-3 space-y-2 text-sm text-secondary-foreground/70">
            <li><Link to="/login">Iniciar sesión</Link></li>
            <li><Link to="/register">Registrarme</Link></li>
            <li><Link to="/forgot">Recuperar contraseña</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Recursos</h4>
          <ul className="mt-3 space-y-2 text-sm text-secondary-foreground/70">
            <li>Blog</li><li>Centro de ayuda</li><li>Comunidad</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-secondary-foreground/60">© 2026 SkilltoMoney · MVP universitario</div>
    </footer>
  );
}
