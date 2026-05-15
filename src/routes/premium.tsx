import { createFileRoute } from "@tanstack/react-router";
import { Crown, Rocket, Award, Zap, CheckCircle2, Star } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/premium")({
  head: () => ({ meta: [{ title: "Mentorías y Premium · SkilltoMoney" }, { name: "description", content: "Mentorías, certificaciones y boost de perfil para acelerar tu carrera freelance." }] }),
  component: Premium,
});

function Premium() {
  return (
    <Shell>
      <section className="bg-hero py-20 text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <Badge className="mb-4 bg-white/15 text-primary-foreground backdrop-blur"><Crown className="mr-1 h-3 w-3" /> Skill Pro</Badge>
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl">Lleva tu carrera freelance al siguiente nivel</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">Mentorías 1:1, certificaciones reconocidas y boost de visibilidad para conseguir clientes más rápido.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Award, t: "Mentorías 1:1", d: "Sesiones con freelancers expertos en tu rubro." },
            { icon: Crown, t: "Freelancer Pro", d: "Insignia verificada y prioridad en búsquedas." },
            { icon: Rocket, t: "Boost de perfil", d: "Aparece en el top de tu categoría por 7 días." },
            { icon: Award, t: "Certificaciones", d: "Acredita tus skills con cursos oficiales." },
          ].map(x=>(
            <Card key={x.t} className="p-6 transition hover:-translate-y-1 hover:shadow-glow">
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground"><x.icon className="h-5 w-5" /></div>
              <h3 className="font-display font-semibold">{x.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{x.d}</p>
            </Card>
          ))}
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { name:"Free", price:"S/ 0", desc:"Para empezar", features:["Perfil público","3 servicios activos","Mensajería básica"], cta:"Plan actual", highlight:false },
            { name:"Pro", price:"S/ 29", desc:"Para vender más", features:["Servicios ilimitados","Insignia verificada","Boost mensual","IA Assistant avanzada"], cta:"Hacerme Pro", highlight:true },
            { name:"Mentor", price:"S/ 79", desc:"Para crecer rápido", features:["Todo lo de Pro","2 mentorías 1:1 al mes","Certificación oficial","Soporte prioritario"], cta:"Quiero mentor", highlight:false },
          ].map(p=>(
            <Card key={p.name} className={`p-7 ${p.highlight?"border-primary/40 shadow-glow ring-1 ring-primary/30":""}`}>
              {p.highlight && <Badge className="mb-3 bg-gradient-primary">Más popular</Badge>}
              <div className="font-display text-xl font-bold">{p.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">{p.desc}</div>
              <div className="mt-4 flex items-baseline gap-1"><span className="text-4xl font-extrabold text-gradient">{p.price}</span><span className="text-sm text-muted-foreground">/mes</span></div>
              <ul className="mt-5 space-y-2 text-sm">
                {p.features.map(f=>(<li key={f} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />{f}</li>))}
              </ul>
              <Button className={`mt-6 w-full ${p.highlight?"bg-gradient-primary":""}`} variant={p.highlight?"default":"outline"}>{p.cta}</Button>
            </Card>
          ))}
        </div>

        <Card className="mt-16 p-8">
          <div className="flex items-center gap-2 font-display text-2xl font-bold"><Zap className="h-6 w-6 text-primary" /> Próximas mentorías</div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {n:"Cómo cobrar lo que vales",m:"Camila Rojas",d:"Mar 18 · 7pm"},
              {n:"Vende tu primer servicio en 7 días",m:"Diego Salazar",d:"Jue 20 · 6pm"},
              {n:"Branding para freelancers",m:"Lucía Ferrer",d:"Sáb 22 · 11am"},
            ].map(s=>(
              <div key={s.n} className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-1 text-warning text-xs"><Star className="h-3 w-3 fill-current" /> Mentoría en vivo</div>
                <div className="mt-2 font-semibold">{s.n}</div>
                <div className="mt-1 text-xs text-muted-foreground">Con {s.m}</div>
                <div className="mt-3 flex items-center justify-between"><span className="text-xs text-muted-foreground">{s.d}</span><Button size="sm" variant="outline">Reservar</Button></div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </Shell>
  );
}
