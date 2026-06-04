const API_URL = import.meta.env.VITE_API_URL ?? "https://skill-to-money-backend.onrender.com/api";

export const API_BASE_URL = API_URL;

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
  freelancer_profile?: {
    id: number;
    dni: string;
    experience_area?: string | null;
  };
  mype_profile?: {
    id: number;
    business_name: string;
    ruc: string;
    location?: string | null;
  };
};

export type ProfilePayload = {
  id: number;
  user_id: number;
  dni?: string | null;
  ruc?: string | null;
  business_name?: string | null;
  industry?: string | null;
  experience_area?: string | null;
  bio: string | null;
  description: string | null;
  location: string | null;
  contact_phone?: string | null;
  website: string | null;
  availability_status?: string | null;
  rating?: string | null;
  completed_jobs?: number | null;
  visibility_score?: string | null;
  skills: string[] | null;
  social_links: Record<string, string | null> | null;
  profile_photo?: string | null;
  photo_url: string | null;
};

export type CategoryPayload = {
  id: number;
  name: string;
  description: string | null;
  status: string;
};

export type ServicePayload = {
  id: number;
  category_id: number | null;
  category: string | null;
  title: string;
  description: string;
  price: string;
  currency: string;
  delivery_days: number;
  status: "active" | "paused" | "draft";
  views_count: number;
  created_at: string;
};

export type ServiceInput = {
  category_id: number | null;
  title: string;
  description: string;
  price: string;
  currency: string;
  delivery_days: number;
  status: "active" | "paused" | "draft";
};

export type PortfolioProjectPayload = {
  id: number;
  category_id: number | null;
  category: string | null;
  title: string;
  description: string | null;
  image_path: string | null;
  image_url: string | null;
  file_path: string | null;
  file_url: string | null;
  external_url: string | null;
  project_order: number;
  is_featured: boolean;
  created_at: string;
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

export type DniLookupPayload = {
  dni: string;
  first_name: string;
  last_name: string;
  full_name: string | null;
};

export type RucLookupPayload = {
  ruc: string;
  business_name: string;
  state: string;
  condition: string;
  location: string | null;
};

export const api = {
  health: async (): Promise<HealthPayload> => {
    const response = await fetch(`${API_URL}/health`);
    const payload = (await response.json()) as HealthPayload;

    if (!response.ok) {
      throw payload;
    }

    return payload;
  },
  lookupDni: (dni: string) => apiRequest<DniLookupPayload>(`/peru/dni/${dni}`),
  lookupRuc: (ruc: string) => apiRequest<RucLookupPayload>(`/peru/ruc/${ruc}`),
  login: (body: { email: string; password: string }) =>
    apiRequest<AuthPayload>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  registerFreelancer: (body: {
    first_name: string;
    last_name: string;
    dni: string;
    email: string;
    password: string;
    phone?: string;
  }) =>
    apiRequest<AuthPayload>("/auth/register/freelancer", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  registerMype: (body: {
    company_name?: string;
    ruc: string;
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
  resetPassword: (body: { token: string; email: string; password: string; password_confirmation: string }) =>
    apiRequest<null>("/auth/reset-password", {
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
  getCategories: (token: string) => apiRequest<CategoryPayload[]>("/catalog/categories", { token }),
  getServices: (token: string) => apiRequest<ServicePayload[]>("/freelancer/services", { token }),
  createService: (token: string, body: ServiceInput) =>
    apiRequest<ServicePayload>("/freelancer/services", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }),
  updateService: (token: string, id: number, body: ServiceInput) =>
    apiRequest<ServicePayload>(`/freelancer/services/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(body),
    }),
  deleteService: (token: string, id: number) =>
    apiRequest<null>(`/freelancer/services/${id}`, {
      method: "DELETE",
      token,
    }),
  getPortfolioProjects: (token: string) =>
    apiRequest<PortfolioProjectPayload[]>("/freelancer/portfolio", { token }),
  createPortfolioProject: (token: string, body: FormData) =>
    apiRequest<PortfolioProjectPayload>("/freelancer/portfolio", {
      method: "POST",
      token,
      body,
    }),
  updatePortfolioProject: (token: string, id: number, body: FormData) =>
    apiRequest<PortfolioProjectPayload>(`/freelancer/portfolio/${id}`, {
      method: "POST",
      token,
      body,
    }),
  deletePortfolioProject: (token: string, id: number) =>
    apiRequest<null>(`/freelancer/portfolio/${id}`, {
      method: "DELETE",
      token,
    }),
  getRecommendations: (token: string, recommendationType?: string) =>
    apiRequest<RecommendationPayload[]>(
      `/recommendations${recommendationType ? `?type=${encodeURIComponent(recommendationType)}` : ""}`,
      { token },
    ),
};
