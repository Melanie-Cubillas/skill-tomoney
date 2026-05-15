import { Link, useRouterState } from "@tanstack/react-router";
import { Sparkles, LayoutDashboard, Briefcase, MessageSquare, Wallet, Crown, Settings, Search, Users, FolderKanban } from "lucide-react";

export function DashboardShell({ role, children }: { role: "freelancer" | "client"; children: React.ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const items = role === "freelancer"
    ? [
        { to: "/dashboard/freelancer", icon: LayoutDashboard, label: "Inicio" },
        { to: "/dashboard/freelancer/portfolio", icon: FolderKanban, label: "Portafolio" },
        { to: "/dashboard/freelancer/services", icon: Briefcase, label: "Mis servicios" },
        { to: "/dashboard/messages", icon: MessageSquare, label: "Mensajes" },
        { to: "/dashboard/payments", icon: Wallet, label: "Pagos" },
        { to: "/premium", icon: Crown, label: "Premium" },
      ]
    : [
        { to: "/dashboard/client", icon: LayoutDashboard, label: "Inicio" },
        { to: "/talent", icon: Search, label: "Buscar talento" },
        { to: "/dashboard/client/projects", icon: FolderKanban, label: "Mis proyectos" },
        { to: "/dashboard/messages", icon: MessageSquare, label: "Mensajes" },
        { to: "/dashboard/payments", icon: Wallet, label: "Pagos" },
        { to: "/premium", icon: Crown, label: "Premium" },
      ];

  return (
    <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-border bg-sidebar lg:flex lg:flex-col">
        <Link to="/" className="flex items-center gap-2 px-6 py-5 font-display font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></span>
          SkilltoMoney
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          {items.map((it) => {
            const active = path === it.to;
            return (
              <Link key={it.to} to={it.to} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-gradient-primary text-primary-foreground shadow-soft" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                <it.icon className="h-4 w-4" /> {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent">
            <Settings className="h-4 w-4" /> Ajustes
          </Link>
        </div>
      </aside>
      <div className="flex flex-col bg-muted/30">
        <header className="flex items-center justify-between border-b border-border bg-background px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" /> {role === "freelancer" ? "Cuenta Freelancer" : "Cuenta MYPE / Cliente"}
          </div>
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">YO</div>
          </div>
        </header>
        <div className="flex-1 p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
