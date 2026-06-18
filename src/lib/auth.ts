const TOKEN_KEY = "stm_token";
const USER_KEY = "stm_user";

export type SessionUser = {
  id: number;
  name: string;
  account_type: "freelancer" | "mype";
  email: string;
  email_verified_at?: string | null;
  subscription_plan?: "free" | "pro";
  subscription_status?: string | null;
};

export function saveSession(token: string, user: SessionUser): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(TOKEN_KEY);
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

