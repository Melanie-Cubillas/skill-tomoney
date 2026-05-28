import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Zap, Wallet, Users, CheckCircle2, Star, TrendingUp, Shield, Rocket, MessageSquare } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { BackendStatus } from "@/components/BackendStatus";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categories, freelancers, stats } from "@/data/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkilltoMoney — Convierte tus skills digitales en ingresos" },
      { name: "description", content: "Plataforma freelance para jóvenes principiantes y MYPES peruanas. Crea tu portafolio, publica servicios y consigue clientes con pagos protegidos." },
      { property: "og:title", content: "SkilltoMoney — De tus skills a ingresos reales" },
      { property: "og:description", content: "Conectamos freelancers principiantes con MYPES que necesitan talento digital confiable." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <Shell>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute inset-0 noise opacity-[0.05]" />
        <div className="absolute -left-32 top-32 h-96 w-96 rounded-full bg-primary/40 blur-[140px]" />
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-primary-glow/40 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 lg:pb-32 lg:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs backdrop-blur">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-gradient-primary"><Sparkles className="h-2.5 w-2.5" /></span>
                  Beta abierta · Sin comisiones por 90 días
                </div>
                <BackendStatus />
              </div>
              <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                Convierte tus <span className="text-gradient">skills digitales</span>
                <br className="hidden sm:block" /> en ingresos reales.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-white/70">
                SkilltoMoney conecta a jóvenes freelancers con MYPES peruanas que necesitan talento digital confiable. Crea tu perfil, publica tu servicio y empieza a vender hoy.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild className="bg-gradient-primary shadow-glow hover:opacity-95">
                  <Link to="/register">Empezar como Freelancer <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white/20 bg-white/5 text-primary-foreground backdrop-blur hover:bg-white/10">
                  <Link to="/talent">Buscar talento</Link>
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-white/60">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {["CR","DS","LF","MQ","SM"].map(a=>(
                      <div key={a} className="grid h-9 w-9 place-items-center rounded-full border-2 border-[oklch(0.12_0.06_275)] bg-gradient-primary text-[11px] font-bold text-primary-foreground">{a}</div>
                    ))}
                  </div>
                  <span><b className="text-white">+{stats.freelancers}</b> freelancers activos</span>
                </div>
                <div className="flex items-center gap-1 text-warning">
                  {[...Array(5)].map((_,i)=>(<Star key={i} className="h-4 w-4 fill-current" />))}
                  <span className="ml-1 text-white/70">{stats.avgRating} rating promedio</span>
                </div>
              </div>
            </div>

            {/* Hero bento mockup */}
            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-primary opacity-25 blur-3xl" />
              <div className="grid grid-cols-2 gap-3">
                <Card className="col-span-2 border-white/10 bg-white/5 p-5 text-primary-foreground backdrop-blur-xl">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium"><Sparkles className="h-3.5 w-3.5 text-primary-glow" /> IA Assistant</div>
                    <span className="rounded-full bg-success/20 px-2 py-0.5 text-success">● Online</span>
                  </div>
                  <p className="mt-3 text-sm text-white/85">
                    ✨ Tu perfil mejorará si agregas <b>2 proyectos</b> de edición de video. La demanda de Reels subió <b>32%</b> esta semana.
                  </p>
                  <div className="mt-4 rounded-xl bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-white/50">Precio sugerido</div>
                    <div className="mt-0.5 font-display text-2xl font-bold text-gradient">S/ 80 — 120</div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-3/4 rounded-full bg-gradient-primary" />
                    </div>
                  </div>
                </Card>
                <Card className="border-white/10 bg-white/5 p-4 text-primary-foreground backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-xs font-bold">CR</div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold">Camila Rojas</div>
                      <div className="text-[10px] text-white/60">Match 94%</div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {["Branding","Logos"].map(s=>(<span key={s} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">{s}</span>))}
                  </div>
                </Card>
                <Card className="border-white/10 bg-white/5 p-4 text-primary-foreground backdrop-blur-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">Pago en escrow</span>
                    <Shield className="h-3.5 w-3.5 text-success" />
                  </div>
                  <div className="mt-2 font-display text-xl font-bold">S/ 480</div>
                  <div className="text-[10px] text-white/60">Listo para liberar</div>
                  <button className="mt-3 w-full rounded-lg bg-gradient-primary py-1.5 text-[11px] font-semibold">Liberar</button>
                </Card>
                <Card className="col-span-2 border-white/10 bg-white/5 p-4 text-primary-foreground backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-xs">
                    <MessageSquare className="h-3.5 w-3.5 text-primary-glow" /> Mensaje nuevo de <b>Ricardo (MYPE)</b>
                  </div>
                  <p className="mt-2 text-sm text-white/85">"Necesito branding para mi cafetería ¿podemos cerrar hoy?"</p>
                </Card>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur md:grid-cols-4">
            {[
              { v: `+${stats.freelancers}`, l: "freelancers activos" },
              { v: `+${stats.mypes}`, l: "MYPES y emprendimientos" },
              { v: `+${stats.projectsClosed}`, l: "proyectos cerrados" },
              { v: `${stats.avgRating}★`, l: "rating promedio" },
            ].map(s=>(
              <div key={s.l}>
                <div className="font-display text-3xl font-bold text-gradient">{s.v}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/60">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORÍAS — Hero Grid */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between gap-6">
          <div>
            <Badge className="bg-accent text-accent-foreground">Categorías</Badge>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">Servicios digitales que están vendiendo</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">Las habilidades más demandadas por MYPES peruanas este trimestre.</p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link to="/services">Ver todo <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(c=>(
            <Link key={c.slug} to="/services" className="group">
              <Card className="relative overflow-hidden p-5 transition hover:-translate-y-1 hover:shadow-elegant">
                <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${c.color} opacity-20 blur-2xl transition group-hover:opacity-40`} />
                <div className="relative flex items-center gap-4">
                  <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${c.color} text-2xl text-white shadow-soft`}>{c.icon}</div>
                  <div className="flex-1">
                    <div className="font-display font-semibold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.count} freelancers activos</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="bg-muted/40 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge className="bg-accent text-accent-foreground">Cómo funciona</Badge>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">Tres pasos para empezar a vender</h2>
            <p className="mt-3 text-muted-foreground">Sin experiencia previa. Sin tarjeta. Sin enredos.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Users, n: "01", title: "Crea tu perfil", desc: "Sube tu foto, habilidades y portafolio en minutos. Usa plantillas listas." },
              { icon: Zap, n: "02", title: "Publica tu servicio", desc: "Define qué ofreces, tu precio y tiempo de entrega. La IA te sugiere precios." },
              { icon: Wallet, n: "03", title: "Cobra protegido", desc: "El cliente paga con escrow y liberas el dinero al entregar. Sin sustos." },
            ].map((s)=>(
              <Card key={s.n} className="group relative overflow-hidden p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant">
                <div className="absolute right-5 top-5 font-display text-5xl font-bold text-muted-foreground/15">{s.n}</div>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TALENTO DESTACADO */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between gap-6">
          <div>
            <Badge className="bg-accent text-accent-foreground">Talento destacado</Badge>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">Conoce a algunos freelancers</h2>
          </div>
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link to="/talent">Explorar todos <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {freelancers.slice(0,6).map(f=>(
            <Card key={f.id} className="group overflow-hidden p-5 transition hover:-translate-y-1 hover:shadow-elegant">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary font-bold text-primary-foreground shadow-soft">{f.avatar}</div>
                  <div>
                    <div className="font-display font-semibold">{f.name}</div>
                    <div className="text-xs text-muted-foreground">{f.role}</div>
                  </div>
                </div>
                <Badge variant="outline" className="border-primary/30 text-primary">{f.match}% match</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {f.skills.map(s=>(<span key={s} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium">{s}</span>))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
                <div className="flex items-center gap-1 text-warning"><Star className="h-3.5 w-3.5 fill-current" /><span className="font-semibold text-foreground">{f.rating}</span><span className="text-muted-foreground">({f.reviews})</span></div>
                <div className="font-display font-bold">S/ {f.price}<span className="text-xs font-normal text-muted-foreground">/h</span></div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* BENEFICIOS DOBLES */}
      <section className="bg-secondary py-24 text-secondary-foreground">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="relative overflow-hidden border-white/10 bg-white/5 p-8 text-secondary-foreground backdrop-blur">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-primary opacity-30 blur-3xl" />
              <Badge className="relative bg-gradient-primary text-primary-foreground">Para freelancers</Badge>
              <h3 className="relative mt-3 font-display text-3xl font-bold">Empieza a vender hoy, sin experiencia previa</h3>
              <ul className="relative mt-6 space-y-3 text-sm text-white/85">
                {["Plantillas de portafolio listas para usar","IA Assistant que sugiere precios y mejoras","Pagos protegidos con escrow","Mentorías y certificaciones gratuitas"].map(x=>(
                  <li key={x} className="flex gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary-glow" />{x}</li>
                ))}
              </ul>
              <Button className="relative mt-7 bg-gradient-primary shadow-glow" asChild><Link to="/register">Crear mi perfil <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            </Card>
            <Card className="relative overflow-hidden border-white/10 bg-white/5 p-8 text-secondary-foreground backdrop-blur">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-glow/40 blur-3xl" />
              <Badge className="relative bg-white/10 text-secondary-foreground">Para MYPES</Badge>
              <h3 className="relative mt-3 font-display text-3xl font-bold">Encuentra talento digital confiable y a tu medida</h3>
              <ul className="relative mt-6 space-y-3 text-sm text-white/85">
                {["Filtra por categoría, precio y ubicación","Matching inteligente con tu necesidad","Compara perfiles y portafolios reales","Contrato y pagos seguros"].map(x=>(
                  <li key={x} className="flex gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary-glow" />{x}</li>
                ))}
              </ul>
              <Button variant="outline" className="relative mt-7 border-white/20 bg-white/5 text-secondary-foreground hover:bg-white/10" asChild><Link to="/talent">Buscar talento <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            </Card>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Badge className="bg-accent text-accent-foreground">Comunidad</Badge>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">Lo que dicen quienes ya empezaron</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { name: "Camila R.", role: "Diseñadora gráfica · Lima", text: "En 2 semanas conseguí 4 clientes. La IA me ayudó a fijar mejores precios y mi portafolio se ve mucho más pro.", avatar: "CR" },
            { name: "Ricardo Vega", role: "Cafetería Lúmen · MYPE", text: "Encontré un editor de video buenísimo y a muy buen precio para nuestro TikTok. Subimos 3x los seguidores.", avatar: "RV" },
            { name: "Lucía F.", role: "Community Manager · Trujillo", text: "Por fin una plataforma pensada para principiantes. Súper intuitiva y los pagos son seguros.", avatar: "LF" },
          ].map((t)=>(
            <Card key={t.name} className="p-6 shadow-soft transition hover:shadow-elegant">
              <div className="flex gap-1 text-warning">{[...Array(5)].map((_,j)=>(<Star key={j} className="h-3.5 w-3.5 fill-current" />))}</div>
              <p className="mt-4 text-sm leading-relaxed">"{t.text}"</p>
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">{t.avatar}</div>
                <div><div className="text-sm font-semibold">{t.name}</div><div className="text-xs text-muted-foreground">{t.role}</div></div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <Card className="relative overflow-hidden border-0 bg-gradient-hero p-10 text-primary-foreground shadow-glow md:p-16">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-primary/40 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-primary-glow/30 blur-3xl" />
          <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
            <div>
              <Rocket className="mb-3 h-7 w-7" />
              <h2 className="font-display text-4xl font-bold leading-tight sm:text-5xl">¿Listo para vivir de tus skills?</h2>
              <p className="mt-4 max-w-lg text-white/75">Únete a la comunidad de jóvenes que ya están construyendo su negocio digital desde Perú.</p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/70">
                <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> Sin tarjeta</span>
                <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Pagos protegidos</span>
                <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> IA incluida</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button size="lg" asChild className="bg-gradient-primary shadow-glow"><Link to="/register">Soy Freelancer <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
              <Button size="lg" asChild variant="outline" className="border-white/25 bg-white/10 text-primary-foreground hover:bg-white/20"><Link to="/talent">Buscar Talento</Link></Button>
            </div>
          </div>
        </Card>
      </section>
    </Shell>
  );
}
