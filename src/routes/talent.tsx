import { createFileRoute } from "@tanstack/react-router";
import { Search, Star, MapPin, Sparkles } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { freelancers, categories } from "@/data/mock";

export const Route = createFileRoute("/talent")({
  head: () => ({ meta: [{ title: "Buscar talento · SkilltoMoney" }, { name: "description", content: "Encuentra freelancers digitales verificados para tu MYPE o emprendimiento." }] }),
  component: TalentPage,
});

function TalentPage() {
  return (
    <Shell>
      <section className="bg-gradient-soft">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h1 className="font-display text-4xl font-bold">Encuentra el talento perfecto</h1>
          <p className="mt-2 text-muted-foreground">Compara perfiles, portafolios y precios. Contacta directamente.</p>
          <div className="mt-6 flex max-w-2xl items-center gap-2 rounded-2xl border border-border bg-background p-2 shadow-elegant">
            <Search className="ml-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por habilidad, especialidad o nombre..." className="border-0 shadow-none focus-visible:ring-0" />
            <Button className="bg-gradient-primary">Buscar</Button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map(c=>(
              <Badge key={c.slug} variant="secondary" className="cursor-pointer rounded-full bg-background px-3 py-1.5 text-xs hover:bg-accent">{c.icon} {c.name}</Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-accent/60 p-4 text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          <span><b>Recomendados por IA</b> según tu última búsqueda.</span>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {freelancers.map(f=>(
            <Card key={f.id} className="group p-6 transition hover:-translate-y-1 hover:shadow-glow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-primary font-semibold text-primary-foreground">{f.avatar}</div>
                  <div>
                    <div className="font-semibold leading-tight">{f.name}</div>
                    <div className="text-xs text-muted-foreground">{f.role}</div>
                  </div>
                </div>
                <Badge className="bg-success/15 text-success">{f.match}%</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {f.skills.map(s=>(<Badge key={s} variant="secondary" className="bg-accent text-accent-foreground">{s}</Badge>))}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1 text-warning"><Star className="h-4 w-4 fill-current" /><span className="text-foreground font-medium">{f.rating}</span> <span>({f.reviews})</span></span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{f.location}</span>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <div><div className="text-xs text-muted-foreground">Desde</div><div className="font-bold text-gradient">S/ {f.price}/h</div></div>
                <Button size="sm" className="bg-gradient-primary">Contactar</Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </Shell>
  );
}
