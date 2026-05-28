import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, type RecommendationPayload } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/dashboard/client")({
  head: () => ({ meta: [{ title: "Dashboard Cliente · SkilltoMoney" }] }),
  component: ClientDashboard,
});

function ClientDashboard() {
  const [freelancerRecs, setFreelancerRecs] = useState<RecommendationPayload[]>([]);
  const [serviceRecs, setServiceRecs] = useState<RecommendationPayload[]>([]);
  const token = getToken();

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        const [freelancers, services] = await Promise.all([
          api.getRecommendations(token, "freelancer"),
          api.getRecommendations(token, "service"),
        ]);

        setFreelancerRecs(freelancers.data ?? []);
        setServiceRecs(services.data ?? []);
      } catch {
        setFreelancerRecs([]);
        setServiceRecs([]);
      }
    };

    void load();
  }, [token]);

  return (
    <DashboardShell role="client">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hola, MYPE</div>
          <h1 className="mt-1 font-display text-3xl font-bold">Recomendaciones para tu proximo proyecto</h1>
        </div>
        <Button asChild className="bg-gradient-primary shadow-soft"><Link to="/talent">Explorar talento</Link></Button>
      </div>

      <Card className="relative mt-6 overflow-hidden border-primary/20 bg-gradient-hero p-6 text-primary-foreground shadow-glow">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs"><Sparkles className="h-3.5 w-3.5 text-primary-glow" /> Match IA</div>
            <h3 className="mt-1 font-display text-2xl font-bold">Freelancers y servicios sugeridos</h3>
            <p className="mt-2 text-sm text-white/75">Sugerencias basadas en tus preferencias y actividad.</p>
          </div>
          <Button className="bg-white/15 text-primary-foreground backdrop-blur hover:bg-white/25" asChild><Link to="/services">Ver servicios <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-display text-lg font-semibold">Freelancers recomendados</h2>
          <div className="mt-4 space-y-3">
            {(freelancerRecs.length ? freelancerRecs : [{ id: 0, title: "Sin recomendaciones", description: "Aun no hay freelancers sugeridos.", recommendation_type: "freelancer", user_id: 0, score: null, data: null, status: "active" }]).map((rec) => (
              <div key={rec.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{rec.title}</div>
                  <Badge variant="outline">{rec.score ? `${rec.score}%` : "IA"}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{rec.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-lg font-semibold">Servicios recomendados</h2>
          <div className="mt-4 space-y-3">
            {(serviceRecs.length ? serviceRecs : [{ id: -1, title: "Sin recomendaciones", description: "Aun no hay servicios sugeridos.", recommendation_type: "service", user_id: 0, score: null, data: null, status: "active" }]).map((rec) => (
              <div key={rec.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{rec.title}</div>
                  <Badge variant="outline">{rec.score ? `${rec.score}%` : "IA"}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{rec.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
