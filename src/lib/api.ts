const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
  errors: Record<string, string[]> | null;
};

export type HealthPayload = {
  status: "ok";
};

export type AuthUser = {
  id: number;
  name: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  account_type: "freelancer" | "mype";
  email: string;
};

export type AuthPayload = {
  token_type: "Bearer";
  access_token: string;
  expires_at: string | null;
  user: AuthUser;
};

export type ProfilePayload = {
  id: number;
  user_id: number;
  headline: string | null;
  category: string | null;
  bio: string | null;
  description: string | null;
  location: string | null;
  hourly_rate: string | null;
  skills: string[] | null;
  social_links: Record<string, string | null> | null;
  photo_url: string | null;
};

export type RecommendationPayload = {
  id: number;
  user_id: number;
  recommendation_type: string;
  title: string;
  description: string;
  score: string | null;
  data: Record<string, unknown> | null;
  status: string;
};

type RequestOptions = RequestInit & {
  token?: string;
};

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    throw payload;
  }

  return payload;
}

export const api = {
  health: async (): Promise<HealthPayload> => {
    const response = await fetch(`${API_URL}/health`);
    const payload = (await response.json()) as HealthPayload;

    if (!response.ok) {
      throw payload;
    }

    return payload;
  },
  login: (body: { email: string; password: string }) =>
    apiRequest<AuthPayload>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  registerFreelancer: (body: { first_name: string; last_name: string; email: string; password: string; phone?: string }) =>
    apiRequest<AuthPayload>("/auth/register/freelancer", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  registerMype: (body: {
    first_name: string;
    last_name: string;
    company_name?: string;
    email: string;
    password: string;
    phone?: string;
  }) =>
    apiRequest<AuthPayload>("/auth/register/mype", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  forgotPassword: (body: { email: string }) =>
    apiRequest<null>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  logout: (token: string) =>
    apiRequest<null>("/auth/logout", {
      method: "POST",
      token,
    }),
  getProfile: (token: string) => apiRequest<ProfilePayload>("/profile", { token }),
  saveProfile: (token: string, body: Partial<ProfilePayload>) =>
    apiRequest<ProfilePayload>("/profile", {
      method: "PUT",
      token,
      body: JSON.stringify(body),
    }),
  updateSkills: (token: string, skills: string[]) =>
    apiRequest<ProfilePayload>("/profile/skills", {
      method: "PATCH",
      token,
      body: JSON.stringify({ skills }),
    }),
  updateDescription: (token: string, description: string) =>
    apiRequest<ProfilePayload>("/profile/description", {
      method: "PATCH",
      token,
      body: JSON.stringify({ description }),
    }),
  updateSocialLinks: (token: string, social_links: Record<string, string | null>) =>
    apiRequest<ProfilePayload>("/profile/social-links", {
      method: "PATCH",
      token,
      body: JSON.stringify({ social_links }),
    }),
  updatePhoto: (token: string, photo: File) => {
    const body = new FormData();
    body.append("photo", photo);

    return apiRequest<ProfilePayload>("/profile/photo", {
      method: "POST",
      token,
      body,
    });
  },
  getRecommendations: (token: string, recommendationType?: string) =>
    apiRequest<RecommendationPayload[]>(
      `/recommendations${recommendationType ? `?type=${encodeURIComponent(recommendationType)}` : ""}`,
      { token }
    ),
};
