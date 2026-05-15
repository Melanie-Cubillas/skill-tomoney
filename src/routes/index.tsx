import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Rocket, ShieldCheck, Star, Wallet, Users, Zap, CheckCircle2 } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categories } from "@/data/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkilltoMoney — Convierte tus habilidades digitales en ingresos" },
      { name: "description", content: "Plataforma para freelancers principiantes y MYPES: crea tu portafolio, publica servicios y conecta con clientes." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <Shell>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-soft">
        <div className="absolute inset-0 -z-10 opacity-40 [background:radial-gradient(60%_50%_at_50%_0%,oklch(0.85_0.12_295)_0%,transparent_70%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <Badge variant="secondary" className="mb-5 gap-1.5 rounded-full bg-accent text-accent-foreground"><Sparkles className="h-3 w-3" /> Nuevo · Beta abierta</Badge>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Convierte tus <span className="text-gradient">habilidades digitales</span> en ingresos reales.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              SkilltoMoney conecta a jóvenes freelancers con MYPES y emprendimientos que necesitan talento digital confiable. Crea tu perfil, publica tu primer servicio y empieza a vender hoy.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild className="bg-gradient-primary shadow-glow hover:opacity-95">
                <Link to="/register">Registrarme como Freelancer <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/talent">Buscar talento</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {["CR","DS","LF","MQ"].map(a=>(
                  <div key={a} className="grid h-9 w-9 place-items-center rounded-full border-2 border-background bg-gradient-primary text-xs font-semibold text-primary-foreground">{a}</div>
                ))}
              </div>
              <div><span className="font-semibold text-foreground">+1,200 freelancers</span> ya empezaron</div>
            </div>
          </div>

          {/* Hero card mockup */}
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-primary opacity-20 blur-3xl" />
            <Card className="overflow-hidden border-border/60 p-0 shadow-elegant">
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-5 py-3">
                <div className="flex items-center gap-2 text-sm font-medium"><Sparkles className="h-4 w-4 text-primary" /> IA Assistant</div>
                <Badge className="bg-success/15 text-success">Online</Badge>
              </div>
              <div className="space-y-4 p-6">
                <div className="rounded-2xl bg-muted/50 p-4 text-sm">
                  ✨ Tu perfil puede mejorar agregando <b>2 proyectos más</b> de edición de video.
                </div>
                <div className="rounded-2xl bg-accent p-4 text-sm text-accent-foreground">
                  📈 El servicio <b>“Edición TikTok”</b> tiene alta demanda esta semana.
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <div className="text-xs uppercase text-muted-foreground">Precio recomendado</div>
                  <div className="mt-1 text-2xl font-bold text-gradient">S/ 80 — S/ 120</div>
                  <div className="mt-3 h-2 w-full rounded-full bg-muted">
                    <div className="h-2 w-3/4 rounded-full bg-gradient-primary" />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">Visibilidad de tu perfil: 75%</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">¿Cómo funciona SkilltoMoney?</h2>
          <p className="mt-3 text-muted-foreground">Tres pasos para empezar a generar ingresos con tus habilidades.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Users, title: "Crea tu perfil", desc: "Sube tu foto, especialidad, habilidades y portafolio en minutos." },
            { icon: Zap, title: "Publica tu servicio", desc: "Define qué ofreces, tu precio y tiempo de entrega." },
            { icon: Wallet, title: "Recibe pagos protegidos", desc: "El cliente paga con escrow y liberas el dinero al entregar." },
          ].map((s,i)=>(
            <Card key={i} className="group p-6 shadow-elegant transition hover:-translate-y-1 hover:shadow-glow">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* BENEFICIOS DOBLES */}
      <section className="bg-gradient-soft py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-2">
          <Card className="p-8 shadow-elegant">
            <Badge className="bg-primary/10 text-primary">Para freelancers</Badge>
            <h3 className="mt-3 font-display text-2xl font-bold">Empieza a vender hoy, sin experiencia previa</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {["Plantillas de portafolio listas para usar","IA Assistant que sugiere precios y servicios","Pagos protegidos con escrow","Mentorías y certificaciones gratuitas"].map(x=>(
                <li key={x} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />{x}</li>
              ))}
            </ul>
            <Button className="mt-6 bg-gradient-primary" asChild><Link to="/register">Crear mi perfil</Link></Button>
          </Card>
          <Card className="p-8 shadow-elegant">
            <Badge className="bg-secondary/10 text-secondary">Para MYPES</Badge>
            <h3 className="mt-3 font-display text-2xl font-bold">Encuentra talento digital confiable y a tu medida</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {["Filtra por categoría, precio y ubicación","Compara perfiles y portafolios reales","Matching inteligente con tu necesidad","Contacto directo y proyecto seguro"].map(x=>(
                <li key={x} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />{x}</li>
              ))}
            </ul>
            <Button variant="outline" className="mt-6" asChild><Link to="/talent">Buscar talento</Link></Button>
          </Card>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl font-bold">Servicios digitales populares</h2>
            <p className="mt-2 text-muted-foreground">Las categorías con más demanda esta temporada.</p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link to="/services">Ver todo <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(c=>(
            <Link key={c.slug} to="/services" className="group">
              <Card className="flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-glow">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-2xl">{c.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.count} freelancers activos</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="bg-secondary py-20 text-secondary-foreground">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-3xl font-bold">Lo que dicen nuestros usuarios</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { name: "Camila R.", role: "Diseñadora gráfica", text: "En 2 semanas conseguí 4 clientes. La IA me ayudó a fijar mejores precios." },
              { name: "Ricardo, MYPE", role: "Cafetería Lúmen", text: "Encontré un editor de video buenísimo y a buen precio para nuestro TikTok." },
              { name: "Lucía F.", role: "Community Manager", text: "Por fin una plataforma pensada para principiantes. Súper intuitiva." },
            ].map((t,i)=>(
              <Card key={i} className="border-white/10 bg-white/5 p-6 text-secondary-foreground">
                <div className="flex gap-1 text-warning">{[...Array(5)].map((_,j)=>(<Star key={j} className="h-4 w-4 fill-current" />))}</div>
                <p className="mt-3 text-sm leading-relaxed">"{t.text}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-xs font-bold">{t.name[0]}</div>
                  <div><div className="text-sm font-semibold">{t.name}</div><div className="text-xs opacity-70">{t.role}</div></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <Card className="overflow-hidden border-0 bg-hero p-10 text-primary-foreground shadow-glow md:p-14">
          <div className="grid gap-6 md:grid-cols-[2fr_1fr] md:items-center">
            <div>
              <Rocket className="mb-3 h-7 w-7" />
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Empieza gratis hoy</h2>
              <p className="mt-3 max-w-xl text-primary-foreground/80">Únete a la comunidad de jóvenes que ya están viviendo de sus skills digitales.</p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Button size="lg" asChild variant="secondary"><Link to="/register">Soy Freelancer</Link></Button>
              <Button size="lg" asChild variant="outline" className="border-white/30 bg-white/10 text-primary-foreground hover:bg-white/20"><Link to="/talent">Buscar Talento</Link></Button>
            </div>
          </div>
        </Card>
      </section>
    </Shell>
  );
}
