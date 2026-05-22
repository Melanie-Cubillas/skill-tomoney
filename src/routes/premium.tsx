import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, CheckCircle2, Sparkles, Users, Zap } from "lucide-react";

export const Route = createFileRoute("/premium")({
  head: () => ({ meta: [{ title: "Mentorías y Premium · SkilltoMoney" }, { name: "description", content: "Sube de nivel con mentorías y plan Pro de SkilltoMoney." }] }),
  component: () => (
    <Shell>
      <section className="relative overflow-hidden bg-gradient-hero py-20 text-primary-foreground">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <Badge className="bg-white/15 text-primary-foreground backdrop-blur"><Crown className="mr-1 h-3 w-3" /> SkilltoMoney Pro</Badge>
          <h1 className="mt-4 font-display text-5xl font-bold">Mentorías que aceleran tu crecimiento</h1>
          <p className="mt-4 text-white/75">Aprende de freelancers top, recibe feedback real y consigue mejores clientes más rápido.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            { name: "Free", price: "S/ 0", desc: "Perfecto para empezar", cta: "Empezar gratis", features: ["Perfil + portafolio","Hasta 3 servicios","Pagos protegidos","Soporte por correo"], highlight: false },
            { name: "Pro", price: "S/ 29", desc: "Para quienes van en serio", cta: "Probar 14 días gratis", features: ["Todo lo del plan Free","Servicios ilimitados","Badge Pro + más visibilidad","IA Assistant ilimitada","2 mentorías 1:1 al mes"], highlight: true },
            { name: "Mentor", price: "S/ 79", desc: "Para top freelancers", cta: "Postular como Mentor", features: ["Todo lo de Pro","Acceso a clientes premium","Comisiones reducidas","Ingresos por mentorías","Sesiones grupales"], highlight: false },
          ].map(p=>(
            <Card key={p.name} className={`relative overflow-hidden p-8 ${p.highlight ? "border-primary/40 shadow-glow" : "shadow-soft"}`}>
              {p.highlight && <div className="absolute right-4 top-4"><Badge className="bg-gradient-primary text-primary-foreground"><Sparkles className="mr-1 h-3 w-3" /> Recomendado</Badge></div>}
              <div className="font-display text-lg font-semibold">{p.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">{p.desc}</div>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold">{p.price}</span>
                <span className="text-sm text-muted-foreground">/ mes</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm">
                {p.features.map(f=>(<li key={f} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> {f}</li>))}
              </ul>
              <Button className={`mt-7 w-full ${p.highlight ? "bg-gradient-primary shadow-soft" : ""}`} variant={p.highlight ? "default" : "outline"} asChild>
                <Link to="/register">{p.cta}</Link>
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-20">
          <div className="text-center">
            <Badge className="bg-accent text-accent-foreground">Mentores destacados</Badge>
            <h2 className="mt-3 font-display text-3xl font-bold">Aprende de quien ya lo logró</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { n: "Andrea Castro", r: "Branding & Estrategia", price: 80, avatar: "AC", students: 124 },
              { n: "Bruno Tello", r: "Video & TikTok Ads", price: 95, avatar: "BT", students: 98 },
              { n: "Karen López", r: "Freelancer 6 cifras", price: 120, avatar: "KL", students: 210 },
            ].map(m=>(
              <Card key={m.n} className="p-6 transition hover:-translate-y-1 hover:shadow-elegant">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary font-bold text-primary-foreground shadow-soft">{m.avatar}</div>
                  <div>
                    <div className="font-display font-semibold">{m.n}</div>
                    <div className="text-xs text-muted-foreground">{m.r}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {m.students} mentorados</span>
                  <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> Sesión 60min</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <div className="font-display text-lg font-bold">S/ {m.price}</div>
                  <Button size="sm" className="bg-gradient-primary">Reservar</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  ),
});
