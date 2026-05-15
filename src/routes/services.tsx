import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Star, Clock, Filter } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { categories, services } from "@/data/mock";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [{ title: "Marketplace de servicios · SkilltoMoney" }, { name: "description", content: "Explora servicios digitales: diseño, video, marketing, desarrollo, IA y más." }] }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <Shell>
      <section className="bg-gradient-soft">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h1 className="font-display text-4xl font-bold">Marketplace de servicios</h1>
          <p className="mt-2 text-muted-foreground">Explora cientos de servicios digitales publicados por freelancers verificados.</p>
          <div className="mt-6 flex max-w-2xl items-center gap-2 rounded-2xl border border-border bg-background p-2 shadow-elegant">
            <Search className="ml-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Busca un servicio: edición de video, logo, landing..." className="border-0 shadow-none focus-visible:ring-0" />
            <Button className="bg-gradient-primary">Buscar</Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-6">
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Filter className="h-4 w-4" /> Categorías</div>
              <div className="space-y-1.5">
                <button className="w-full rounded-lg bg-accent px-3 py-2 text-left text-sm font-medium text-accent-foreground">Todas</button>
                {categories.map(c=>(
                  <button key={c.slug} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted">
                    <span>{c.icon} {c.name}</span><span className="text-xs">{c.count}</span>
                  </button>
                ))}
              </div>
            </Card>
            <Card className="p-5">
              <div className="mb-3 text-sm font-semibold">Precio</div>
              <div className="flex gap-2"><Input placeholder="Min" /><Input placeholder="Max" /></div>
              <Button variant="outline" className="mt-3 w-full">Aplicar</Button>
            </Card>
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>{services.length} servicios encontrados</span>
              <select className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
                <option>Más relevantes</option><option>Mejor calificados</option><option>Precio: menor a mayor</option>
              </select>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {services.map(s=>(
                <Card key={s.id} className="group overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-glow">
                  <div className="relative h-36 bg-gradient-primary">
                    <Badge className="absolute right-3 top-3 bg-white/90 text-foreground">{s.category}</Badge>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="grid h-7 w-7 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">{s.freelancer.split(" ").map(n=>n[0]).join("")}</div>
                      <span className="font-medium">{s.freelancer}</span>
                      <span className="ml-auto flex items-center gap-1 text-warning"><Star className="h-3.5 w-3.5 fill-current" /><span className="text-foreground">{s.rating}</span></span>
                    </div>
                    <h3 className="mt-3 line-clamp-2 font-semibold leading-snug">{s.title}</h3>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {s.days} días</div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Desde</div>
                        <div className="text-lg font-bold text-gradient">S/ {s.price}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
