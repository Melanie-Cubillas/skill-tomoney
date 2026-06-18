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
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  UserRound,
  Users,
  Wallet,
  X,
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
  const isPro = user?.subscription_plan === "pro";
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("skill-to-money:sidebar-collapsed") === "true";
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const items = role === "freelancer"
    ? [
        { to: "/dashboard/freelancer", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/dashboard/freelancer/profile", icon: UserRound, label: "Perfil" },
        { to: "/dashboard/freelancer/portfolio", icon: FolderKanban, label: "Portafolio" },
        { to: "/dashboard/freelancer/services", icon: Briefcase, label: "Servicios" },
        { to: "/dashboard/freelancer/projects", icon: Search, label: "Buscar proyectos" },
        { to: "/dashboard/contracts", icon: FileText, label: "Contratos" },
        { to: "/dashboard/messages", icon: MessageSquare, label: "Chat" },
        { to: "/dashboard/payments", icon: Wallet, label: "Wallet" },
      ]
    : [
        { to: "/dashboard/client", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/dashboard/client/profile", icon: UserRound, label: "Perfil" },
        { to: "/dashboard/client/projects", icon: FileText, label: "Publicaciones" },
        { to: "/dashboard/client/search", icon: Search, label: "Buscar freelancers" },
        { to: "/dashboard/client/services", icon: Briefcase, label: "Explorar servicios" },
        { to: "/dashboard/contracts", icon: FileText, label: "Contratos" },
        { to: "/dashboard/messages", icon: MessageSquare, label: "Chat" },
        { to: "/dashboard/payments", icon: Wallet, label: "Wallet" },
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
    if (typeof window === "undefined") return;
    window.localStorage.setItem("skill-to-money:sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [path]);

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
    <div
      className="min-h-screen bg-background lg:grid"
      style={{ gridTemplateColumns: sidebarCollapsed ? "88px 1fr" : "256px 1fr" }}
    >
      <aside className="hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex lg:flex-col">
        <div className={`flex items-center gap-2.5 py-5 ${sidebarCollapsed ? "justify-center px-3" : "px-6"}`}>
          {!sidebarCollapsed ? (
            <img src="/brand/skill-to-money-logo-white.png" alt="Skill-to-Money" className="h-auto w-[160px] object-contain" />
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-sm font-black text-sidebar">
              S2M
            </span>
          )}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((value) => !value)}
            className={`grid h-12 w-12 place-items-center rounded-2xl border border-secondary/45 bg-sidebar-accent/70 text-sidebar-foreground shadow-soft transition hover:border-secondary hover:bg-secondary/20 hover:text-secondary ${sidebarCollapsed ? "" : "ml-auto"}`}
            aria-label={sidebarCollapsed ? "Mostrar menú lateral" : "Ocultar menú lateral"}
            title={sidebarCollapsed ? "Mostrar menú" : "Ocultar menú"}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        </div>
        {!sidebarCollapsed ? (
          <div className="px-4 pb-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            {role === "freelancer" ? "Freelancer" : "Navegación"}
          </div>
        ) : null}
        <nav className={`flex-1 space-y-1 ${sidebarCollapsed ? "px-2" : "px-3"}`}>
          {items.map((it) => {
            const active = path === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                title={sidebarCollapsed ? it.label : undefined}
                className={`flex items-center rounded-xl py-2.5 text-sm font-medium transition ${sidebarCollapsed ? "justify-center px-2" : "gap-3 px-3"} ${
                  active
                    ? "bg-gradient-primary text-primary-foreground shadow-soft"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <it.icon className="h-4 w-4" />
                {!sidebarCollapsed ? it.label : null}
              </Link>
            );
          })}
        </nav>
        {!sidebarCollapsed ? (
        <div className="m-3 rounded-2xl border border-secondary/30 bg-secondary/15 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary-glow">
            <Crown className="h-3.5 w-3.5" /> {isPro ? "Plan Pro activo" : role === "freelancer" ? "SkillPro" : "SkillPro MYPE"}
          </div>
          <p className="mt-1.5 text-xs text-sidebar-foreground/75">
            {isPro
              ? "Tu suscripción Pro ya está habilitada en este modo."
              : role === "freelancer"
                ? "Skill Bot ilimitado, más servicios y mejor visibilidad."
                : "Más publicaciones, mejor alcance y acceso a talento recomendado."}
          </p>
          <Link to="/dashboard/premium" className="mt-3 inline-flex w-full justify-center rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            {isPro ? "Ver plan" : "Subir a Pro"}
          </Link>
        </div>
        ) : (
          <Link
            to="/dashboard/premium"
            className="mx-2 mb-3 grid h-11 place-items-center rounded-xl border border-secondary/30 bg-secondary/15 text-primary-glow"
            title={isPro ? "Plan Pro activo" : "SkillPro"}
          >
            <Crown className="h-4 w-4" />
          </Link>
        )}
        <div className={`border-t border-sidebar-border p-3 ${sidebarCollapsed ? "space-y-1 px-2" : ""}`}>
          <Link
            to={role === "freelancer" ? "/dashboard/freelancer/profile" : "/dashboard/client/profile"}
            title={sidebarCollapsed ? "Ajustes" : undefined}
            className={`flex items-center rounded-xl py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent ${sidebarCollapsed ? "justify-center px-2" : "gap-3 px-3"}`}
          >
            <Settings className="h-4 w-4" /> {!sidebarCollapsed ? "Ajustes" : null}
          </Link>
          <button
            onClick={onLogout}
            title={sidebarCollapsed ? "Cerrar sesión" : undefined}
            className={`mt-1 flex w-full items-center rounded-xl py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent ${sidebarCollapsed ? "justify-center px-2" : "gap-3 px-3"}`}
          >
            <LogOut className="h-4 w-4" /> {!sidebarCollapsed ? "Cerrar sesión" : null}
          </button>
        </div>
      </aside>
      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            aria-label="Cerrar menú lateral"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="relative flex h-full w-[min(86vw,320px)] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-elegant">
            <div className="flex items-center gap-3 px-5 py-5">
              <img src="/brand/skill-to-money-logo-white.png" alt="Skill-to-Money" className="h-auto w-[165px] object-contain" />
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="ml-auto grid h-11 w-11 place-items-center rounded-2xl border border-sidebar-border bg-sidebar-accent/70 text-sidebar-foreground transition hover:bg-secondary/20 hover:text-secondary"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 pb-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
              {role === "freelancer" ? "Freelancer" : "Navegación"}
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
              {items.map((it) => {
                const active = path === it.to;
                return (
                  <Link
                    key={it.to}
                    to={it.to}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-gradient-primary text-primary-foreground shadow-soft"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <it.icon className="h-4 w-4" />
                    {it.label}
                  </Link>
                );
              })}
            </nav>

            <div className="m-3 rounded-2xl border border-secondary/30 bg-secondary/15 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary-glow">
                <Crown className="h-3.5 w-3.5" /> {isPro ? "Plan Pro activo" : role === "freelancer" ? "SkillPro" : "SkillPro MYPE"}
              </div>
              <p className="mt-1.5 text-xs text-sidebar-foreground/75">
                {isPro
                  ? "Tu suscripción Pro ya está habilitada en este modo."
                  : role === "freelancer"
                    ? "Skill Bot ilimitado, más servicios y mejor visibilidad."
                    : "Más publicaciones, mejor alcance y acceso a talento recomendado."}
              </p>
              <Link
                to="/dashboard/premium"
                onClick={() => setMobileSidebarOpen(false)}
                className="mt-3 inline-flex w-full justify-center rounded-lg bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
              >
                {isPro ? "Ver plan" : "Subir a Pro"}
              </Link>
            </div>

            <div className="border-t border-sidebar-border p-3">
              <Link
                to={role === "freelancer" ? "/dashboard/freelancer/profile" : "/dashboard/client/profile"}
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent"
              >
                <Settings className="h-4 w-4" /> Ajustes
              </Link>
              <button
                onClick={onLogout}
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent"
              >
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      ) : null}
      <div className="flex flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-6 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="mr-1 inline-flex h-11 items-center gap-2 rounded-2xl border border-border bg-card px-3 font-semibold text-foreground shadow-soft transition hover:border-secondary hover:text-secondary lg:hidden"
              aria-label="Abrir menú lateral"
            >
              <Menu className="h-5 w-5" />
              <span className="text-sm">Menú</span>
            </button>
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
                      Ir al chat
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


