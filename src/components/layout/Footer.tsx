import { Link } from "@tanstack/react-router";
import { ArrowRight, Instagram, Linkedin, Music2, Play } from "lucide-react";

const footerColumns = [
  { title: "Producto", links: [["Servicios", "/services"], ["Categorías", "/#categorias"], ["Freelancers", "/talent"], ["Precios", "/premium"]] },
  { title: "Cuenta", links: [["Soy Freelancer", "/register"], ["Soy Cliente", "/register"], ["Iniciar sesión", "/login"], ["Registro", "/register"]] },
  { title: "Recursos", links: [["Blog", "/"], ["Centro de ayuda", "/"], ["IA para freelancers", "/premium"], ["Comunidad", "/#comunidad"]] },
  { title: "Legal", links: [["Términos", "/"], ["Privacidad", "/"], ["Cookies", "/"], ["Política de pagos", "/"]] },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#020608] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.2fr_repeat(4,0.8fr)_1.4fr]">
        <div>
          <Link to="/" className="flex items-center gap-3" aria-label="Skill-to-Money inicio">
            <img
              src="/brand/skill-to-money-logo-white.png"
              alt="Skill-to-Money"
              className="h-auto w-[168px] object-contain"
            />
          </Link>
          <p className="mt-4 max-w-[220px] text-sm leading-relaxed text-white/65">Convertimos habilidades digitales en ingresos reales.</p>
          <div className="mt-6 flex gap-3">
            {[Instagram, Music2, Play, Linkedin].map((Icon, index) => (
              <a key={index} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/75 transition hover:border-accent/70 hover:text-accent">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <div className="font-display text-sm font-bold text-white">{column.title}</div>
            <ul className="mt-4 space-y-2.5 text-sm text-white/65">
              {column.links.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="transition hover:text-accent">{label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-ring">
          <div className="font-display text-sm font-bold">Mantente al día 🚀</div>
          <p className="mt-2 text-sm leading-relaxed text-white/65">Recibe tips, oportunidades y novedades en tu correo.</p>
          <form className="mt-4 flex overflow-hidden rounded-xl border border-white/10 bg-[#071014] p-1">
            <input className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/35" placeholder="Tu correo electrónico" type="email" />
            <button className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-[#061013]" type="button" aria-label="Enviar correo">
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-white/55">
        © 2026 · Todos los derechos reservados.
      </div>
    </footer>
  );
}
