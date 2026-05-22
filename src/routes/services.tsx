import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { services, categories } from "@/data/mock";
import { Search, SlidersHorizontal, Star, Clock } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [{ title: "Servicios · SkilltoMoney" }, { name: "description", content: "Explora servicios digitales publicados por freelancers." }] }),
  component: () => (
    <Shell>
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <Badge className="bg-accent text-accent-foreground">Marketplace</Badge>
          <h1 className="mt-3 font-display text-4xl font-bold">Servicios digitales</h1>
          <p className="mt-2 text-muted-foreground">Compra paquetes listos publicados por freelancers verificados.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar servicios, ej. 'logo cafetería'..." />
            </div>
            <Button variant="outline"><SlidersHorizontal className="mr-1.5 h-4 w-4" /> Filtros</Button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">Todos</button>
            {categories.map(c=>(
              <button key={c.slug} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium hover:bg-muted">
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(s=>(
            <Card key={s.id} className="group overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-elegant">
              <div className="relative h-36 bg-gradient-hero">
                <div className="absolute inset-0 grid-pattern opacity-40" />
                <Badge className="absolute left-3 top-3 bg-white/15 text-primary-foreground backdrop-blur">{s.tag}</Badge>
                <div className="absolute bottom-3 right-3 rounded-lg bg-black/40 px-2 py-1 text-xs text-white backdrop-blur">{s.category}</div>
              </div>
              <div className="p-5">
                <h3 className="font-display font-semibold leading-snug">{s.title}</h3>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-primary text-[10px] font-bold text-primary-foreground">{s.avatar}</div>
                  {s.freelancer}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="flex items-center gap-1 text-warning"><Star className="h-3.5 w-3.5 fill-current" /><span className="font-semibold text-foreground">{s.rating}</span></span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {s.days}d</span>
                  </div>
                  <div className="font-display font-bold">S/ {s.price}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </Shell>
  ),
});
