import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary">
              <span className="font-display text-sm font-bold text-primary-foreground">S</span>
            </span>
            <span className="font-display text-base font-bold">SkilltoMoney</span>
          </div>
          <p className="mt-4 text-sm opacity-70">Convierte tus habilidades digitales en ingresos reales.</p>
        </div>
        {[
          { t: "Producto", l: [["Servicios","/services"],["Talento","/talent"],["Mentorías","/premium"]] },
          { t: "Cuenta", l: [["Soy Freelancer","/dashboard/freelancer"],["Soy Cliente","/dashboard/client"],["Registro","/register"]] },
          { t: "Legal", l: [["Términos","/"],["Privacidad","/"],["Cookies","/"]] },
        ].map((s) => (
          <div key={s.t}>
            <div className="font-display text-sm font-semibold uppercase tracking-wider opacity-60">{s.t}</div>
            <ul className="mt-4 space-y-2.5 text-sm">
              {s.l.map(([n, h]) => (
                <li key={n}><Link to={h} className="opacity-80 transition hover:opacity-100">{n}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 px-6 py-5 text-center text-xs opacity-60">
        © {new Date().getFullYear()} SkilltoMoney · MVP universitario · Hecho con 💜 en Perú
      </div>
    </footer>
  );
}
