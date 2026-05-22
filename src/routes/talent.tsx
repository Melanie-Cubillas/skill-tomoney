import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { freelancers } from "@/data/mock";
import { Search, MapPin, Star, Sparkles } from "lucide-react";

export const Route = createFileRoute("/talent")({
  head: () => ({ meta: [{ title: "Buscar talento · SkilltoMoney" }, { name: "description", content: "Encuentra freelancers verificados para tu MYPE." }] }),
  component: () => (
    <Shell>
      <section className="border-b border-border bg-gradient-hero py-14 text-primary-foreground">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="mx-auto max-w-7xl px-6">
          <Badge className="bg-white/15 text-primary-foreground backdrop-blur">Matching IA</Badge>
          <h1 className="mt-3 font-display text-4xl font-bold">Encuentra al freelancer perfecto</h1>
          <p className="mt-2 max-w-xl text-white/70">Filtra por categoría, precio y ubicación. Nuestra IA recomienda el mejor match para tu proyecto.</p>
          <div className="mt-6 flex flex-wrap gap-3 rounded-2xl border border-white/15 bg-white/5 p-2 backdrop-blur">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
              <Input className="border-0 bg-transparent pl-9 text-primary-foreground placeholder:text-white/50 focus-visible:ring-0" placeholder="¿Qué necesitas? ej. 'editor reels'" />
            </div>
            <Button className="bg-gradient-primary shadow-glow"><Sparkles className="mr-1.5 h-4 w-4" /> Buscar con IA</Button>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {freelancers.map(f=>(
            <Card key={f.id} className="group p-6 transition hover:-translate-y-1 hover:shadow-elegant">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary font-bold text-primary-foreground shadow-soft">{f.avatar}</div>
                    <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-card bg-success" />
                  </div>
                  <div>
                    <div className="font-display font-semibold">{f.name}</div>
                    <div className="text-xs text-muted-foreground">{f.role}</div>
                  </div>
                </div>
                <Badge variant="outline" className="border-primary/30 text-primary">{f.match}%</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {f.skills.map(s=>(<span key={s} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium">{s}</span>))}
              </div>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {f.location}</span>
                <span>·</span>
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">{f.level}</span>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
                <div className="flex items-center gap-1 text-warning"><Star className="h-3.5 w-3.5 fill-current" /><span className="font-semibold text-foreground">{f.rating}</span><span className="text-muted-foreground">({f.reviews})</span></div>
                <div className="font-display font-bold">S/ {f.price}<span className="text-xs font-normal text-muted-foreground">/h</span></div>
              </div>
              <Button className="mt-4 w-full bg-gradient-primary shadow-soft">Contactar</Button>
            </Card>
          ))}
        </div>
      </section>
    </Shell>
  ),
});
