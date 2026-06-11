import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  Briefcase,
  Crown,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { api, type NotificationItem } from "@/lib/api";
import { clearSession, getSessionUser, getToken } from "@/lib/auth";

const POLL_INTERVAL = 15000;

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
  const token = getToken();
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const items = role === "freelancer"
    ? [
        { to: "/dashboard/freelancer", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/dashboard/freelancer/profile", icon: UserRound, label: "Dashboard Freelancer" },
        { to: "/dashboard/freelancer/portfolio", icon: FolderKanban, label: "Portafolio" },
        { to: "/dashboard/freelancer/services", icon: Briefcase, label: "Servicios" },
        { to: "/dashboard/freelancer/projects", icon: Search, label: "Buscar proyectos" },
        { to: "/dashboard/messages", icon: MessageSquare, label: "Mensajes" },
        { to: "/dashboard/payments", icon: Wallet, label: "Pagos" },
        { to: "/dashboard/premium", icon: Crown, label: "Premium" },
      ]
    : [
        { to: "/dashboard/client", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/dashboard/client/profile", icon: UserRound, label: "Dashboard MYPE" },
        { to: "/dashboard/client/projects", icon: FileText, label: "Publicaciones" },
        { to: "/dashboard/client/search", icon: Search, label: "Buscar freelancers" },
        { to: "/dashboard/client/services", icon: Briefcase, label: "Explorar servicios" },
        { to: "/dashboard/messages", icon: MessageSquare, label: "Mensajes" },
        { to: "/dashboard/payments", icon: Wallet, label: "Pagos" },
        { to: "/dashboard/premium", icon: Crown, label: "Premium" },
      ];

  const fetchUnread = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.getUnreadCount(token);
      setUnreadTotal(res.data?.total ?? 0);
    } catch {
      // silent
    }
  }, [token]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.getNotifications(token);
      setNotifications(res.data?.notifications ?? []);
    } catch {
      // silent
    }
  }, [token]);

  useEffect(() => {
    void fetchUnread();
    const interval = setInterval(() => void fetchUnread(), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  useEffect(() => {
    if (!showDropdown) return;
    void fetchNotifications();
  }, [showDropdown, fetchNotifications]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  const markRead = async (id: number) => {
    if (!token) return;
    try {
      await api.markNotificationRead(token, id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)),
      );
      void fetchUnread();
    } catch {
      // silent
    }
  };

  const markAllRead = async () => {
    if (!token) return;
    try {
      await api.markAllNotificationsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
      void fetchUnread();
    } catch {
      // silent
    }
  };

  const handleNotificationClick = (n: NotificationItem) => {
    const convId = n.data?.conversation_id as number | undefined;
    if (convId) {
      void navigate({ to: "/dashboard/messages", search: { conversation: convId } });
    }
    if (!n.read_at) {
      void markRead(n.id);
    }
    setShowDropdown(false);
  };

  const onLogout = async () => {
    try {
      const token_ = getToken();
      if (token_) {
        await api.logout(token_);
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
        <div className="flex items-center gap-2.5 px-6 py-5">
          <img src="/brand/skill-to-money-logo-white.png" alt="Skill-to-Money" className="h-auto w-[160px] object-contain" />
        </div>
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
            {role === "freelancer" ? "Mentorias 1:1, Skill Bot ilimitado y mejor visibilidad." : "Publicaciones destacadas y acceso a talento verificado."}
          </p>
          <Link to="/dashboard/premium" className="mt-3 inline-flex w-full justify-center rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            Subir a Pro
          </Link>
        </div>
        <div className="border-t border-sidebar-border p-3">
          <Link to={role === "freelancer" ? "/dashboard/freelancer/profile" : "/dashboard/client/profile"} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent">
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
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setShowDropdown((v) => !v)}
                className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
              >
                <Bell className="h-4 w-4" />
                {unreadTotal > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                    {unreadTotal > 9 ? "9+" : unreadTotal}
                  </span>
                ) : null}
              </button>
              {showDropdown ? (
                <div className="absolute right-0 top-full z-50 mt-2 w-[360px] overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <span className="text-sm font-bold">Notificaciones</span>
                    {notifications.some((n) => !n.read_at) ? (
                      <button
                        onClick={() => void markAllRead()}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Marcar todas leidas
                      </button>
                    ) : null}
                  </div>
                  <div className="max-h-[360px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-8 text-center text-xs text-muted-foreground">
                        Sin notificaciones
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition hover:bg-muted/40 ${!n.read_at ? "bg-muted/20" : ""}`}
                        >
                          <span
                            className={`mt-1 grid h-2 w-2 shrink-0 rounded-full ${!n.read_at ? "bg-primary" : "bg-transparent"}`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold">{n.title}</div>
                            <div className="line-clamp-2 text-xs text-muted-foreground">
                              {n.message}
                            </div>
                            <div className="mt-1 text-[10px] text-muted-foreground">
                              {formatRelativeTime(n.created_at)}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="border-t border-border p-2">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        void navigate({ to: "/dashboard/messages" });
                      }}
                      className="w-full rounded-xl px-3 py-2 text-center text-xs font-medium text-primary hover:bg-muted/40"
                    >
                      Ir a mensajes
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
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

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return new Date(iso).toLocaleDateString("es-PE", { day: "numeric", month: "short" });
}


