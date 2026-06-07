import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Briefcase, MessageSquare, Wallet, Crown, Settings, Search, Users, FolderKanban, Bell, LogOut, UserRound, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { clearSession, getSessionUser, getToken } from "@/lib/auth";

export function DashboardShell({
  role,
  children,
  profilePhotoUrl,
}: {
  role: "freelancer" | "client";
  children: React.ReactNode;
  profilePhotoUrl?: string | null;
}) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const user = getSessionUser();
  const items = role === "freelancer"
    ? [
        { to: "/dashboard/freelancer", icon: LayoutDashboard, label: "Inicio" },
        { to: "/dashboard/freelancer/profile", icon: UserRound, label: "Perfil Freelancer" },
        { to: "/dashboard/freelancer/portfolio", icon: FolderKanban, label: "Portafolio" },
        { to: "/dashboard/freelancer/services", icon: Briefcase, label: "Servicios" },
        { to: "/dashboard/messages", icon: MessageSquare, label: "Mensajes" },
        { to: "/dashboard/payments", icon: Wallet, label: "Pagos" },
        { to: "/premium", icon: Crown, label: "Premium" },
      ]
    : [
        { to: "/dashboard/client", icon: LayoutDashboard, label: "Inicio" },
        { to: "/dashboard/client/profile", icon: UserRound, label: "Perfil MYPE" },
        { to: "/dashboard/client/projects", icon: FileText, label: "Publicaciones" },
        { to: "/talent", icon: Search, label: "Buscar talento" },
        { to: "/dashboard/messages", icon: MessageSquare, label: "Mensajes" },
        { to: "/dashboard/payments", icon: Wallet, label: "Pagos" },
        { to: "/premium", icon: Crown, label: "Premium" },
      ];

  const onLogout = async () => {
    try {
      const token = getToken();
      if (token) {
        await api.logout(token);
      }
    } catch {
      // no-op
    } finally {
      clearSession();
      navigate({ to: "/login" });
    }
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[256px_1fr]">
      <aside className="hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
        <Link to="/" className="flex items-center gap-2.5 px-6 py-5">
          <img src="/brand/skill-to-money-logo-white.png" alt="Skill-to-Money" className="h-auto w-[160px] object-contain" />
        </Link>
        <div className="px-4 pb-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          {role === "freelancer" ? "Freelancer" : "Navegacion"}
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {items.map((it) => {
            const active = path === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-gradient-primary text-primary-foreground shadow-soft"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <it.icon className="h-4 w-4" /> {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="m-3 rounded-2xl border border-secondary/30 bg-secondary/15 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary-glow">
            <Crown className="h-3.5 w-3.5" /> {role === "freelancer" ? "Skill Pro" : "Skill Pro para MYPES"}
          </div>
          <p className="mt-1.5 text-xs text-sidebar-foreground/75">
            {role === "freelancer" ? "Mentorias 1:1, IA ilimitada y mejor visibilidad." : "Publicaciones destacadas y acceso a talento verificado."}
          </p>
          <Link to="/premium" className="mt-3 inline-flex w-full justify-center rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            Subir a Pro
          </Link>
        </div>
        <div className="border-t border-sidebar-border p-3">
          <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent">
            <Settings className="h-4 w-4" /> Ajustes
          </Link>
          <button onClick={onLogout} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4" /> Cerrar sesion
          </button>
        </div>
      </aside>
      <div className="flex flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-6 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" /> {role === "freelancer" ? "Modo Freelancer" : "Modo MYPE"}
          </div>
          <div className="flex items-center gap-3">
            <button className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>
            {profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt="Foto de perfil" className="h-9 w-9 rounded-full object-cover shadow-soft ring-2 ring-primary/20" />
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-soft">
                {(user?.name || "YO").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="hidden leading-tight md:block">
              <div className="text-sm font-bold">{user?.name ?? (role === "freelancer" ? "Andrea Ruiz" : "Cafe Lumen")}</div>
              <div className="text-xs text-muted-foreground">{role === "freelancer" ? "Freelancer" : "MYPE"}</div>
            </div>
          </div>
        </header>
        <div className="flex-1 p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
