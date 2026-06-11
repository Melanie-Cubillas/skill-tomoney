import { Link } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, LogOut } from "lucide-react";
import { api } from "@/lib/api";
import { clearSession, getSessionUser, getToken, type SessionUser } from "@/lib/auth";

const navItems = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#categorias", label: "Categorías" },
  { href: "/#freelancers", label: "Freelancers" },
  { href: "/#mypes", label: "MYPES" },
  { href: "/#comunidad", label: "Comunidad" },
];

export function Header() {
  const navigate = useNavigate();
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(() => getSessionUser());
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const dashboardPath = sessionUser?.account_type === "mype" ? "/dashboard/client" : "/dashboard/freelancer";
  const avatarLabel = useMemo(() => {
    const source = sessionUser?.name || sessionUser?.email || "YO";

    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [sessionUser]);

  useEffect(() => {
    const token = getToken();
    const user = getSessionUser();
    let isMounted = true;

    setSessionUser(user);

    if (!token || !user) {
      return () => {
        isMounted = false;
      };
    }

    api.getProfile(token)
      .then((response) => {
        if (isMounted) setProfilePhotoUrl(response.data?.photo_url ?? null);
      })
      .catch(() => {
        if (isMounted) setProfilePhotoUrl(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
      setSessionUser(null);
      setProfilePhotoUrl(null);
      setMenuOpen(false);
      navigate({ to: "/login" });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#020608]/95 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-5 px-5 sm:px-6">
        <Link to="/" className="group flex items-center gap-3" aria-label="Skill-to-Money inicio">
          <img
            src="/brand/skill-to-money-logo-white.png"
            alt="Skill-to-Money"
            className="h-auto w-[138px] object-contain sm:w-[168px]"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-white/80 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="relative transition hover:text-white first:text-white first:after:absolute first:after:-bottom-2 first:after:left-0 first:after:h-0.5 first:after:w-full first:after:rounded-full first:after:bg-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {sessionUser ? (
          <div className="flex items-center gap-3">
            <Link
              to={dashboardPath}
              className="inline-flex items-center rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_16px_40px_-22px_#ff442f] transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-20px_#ff442f]"
            >
              Dashboard
            </Link>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-primary text-sm font-extrabold text-white ring-2 ring-white/15"
                aria-label="Menu de usuario"
              >
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
                ) : (
                  avatarLabel || "YO"
                )}
              </button>
              {menuOpen ? (
                <div className="absolute right-0 mt-3 w-56 rounded-xl border border-white/10 bg-[#071014] p-2 text-sm shadow-elegant">
                  <div className="border-b border-white/10 px-3 py-2">
                    <div className="truncate font-bold text-white">{sessionUser.name}</div>
                    <div className="text-xs text-white/55">{sessionUser.account_type === "mype" ? "MYPE" : "Freelancer"}</div>
                  </div>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesion
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-sm font-semibold text-white/80 transition hover:text-white sm:block">
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_16px_40px_-22px_#ff442f] transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-20px_#ff442f]"
            >
              Empieza gratis
              <ArrowRight className="hidden h-4 w-4 sm:block" />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
