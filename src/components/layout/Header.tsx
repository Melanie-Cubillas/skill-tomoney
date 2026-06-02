import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#categorias", label: "Categorías" },
  { href: "/talent", label: "Freelancers" },
  { href: "/register", label: "MYPES" },
  { href: "/#comunidad", label: "Comunidad" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#020608]/95 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-5 px-5 sm:px-6">
        <Link to="/" className="group flex items-center gap-3" aria-label="Skill-to-Money inicio">
          <img
            src="/brand/skill-to-money-logo-white.png"
            alt="Skill-to-Money"
            className="h-auto w-[138px] object-contain sm:w-[168px]"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-white/80 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="relative transition hover:text-white first:text-white first:after:absolute first:after:-bottom-2 first:after:left-0 first:after:h-0.5 first:after:w-full first:after:rounded-full first:after:bg-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden text-sm font-semibold text-white/80 transition hover:text-white sm:block">
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_16px_40px_-22px_#ff442f] transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-20px_#ff442f]"
          >
            Empieza gratis
            <ArrowRight className="hidden h-4 w-4 sm:block" />
          </Link>
        </div>
      </div>
    </header>
  );
}
