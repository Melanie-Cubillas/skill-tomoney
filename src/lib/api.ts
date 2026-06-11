const API_URL = import.meta.env.VITE_API_URL ?? "https://skill-to-money-backend.onrender.com/api";

export const API_BASE_URL = API_URL;
export const API_ROOT_URL = API_URL.replace(/\/api\/?$/, "");

const responseCache = new Map<string, { expiresAt: number; payload: unknown }>();
const inFlightRequests = new Map<string, Promise<unknown>>();
const PERSISTED_CACHE_PREFIX = "skill-to-money:api-cache:v2:";

export function resolveAssetUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value;
  }

  const normalizedRoot = API_ROOT_URL.replace(/\/$/, "");
  const normalizedPath = value.startsWith("/") ? value : `/${value}`;

  return `${normalizedRoot}${normalizedPath}`;
}

function buildCacheKey(path: string, token?: string, customKey?: string): string {
  if (customKey) return customKey;

  const tokenKey = token ? token.slice(-12) : "guest";
  return `${tokenKey}:${path}`;
}

function readPersistedCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(`${PERSISTED_CACHE_PREFIX}${key}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { expiresAt: number; payload: T };

    if (parsed.expiresAt <= Date.now()) {
      window.sessionStorage.removeItem(`${PERSISTED_CACHE_PREFIX}${key}`);
      return null;
    }

    return parsed.payload;
  } catch {
    return null;
  }
}

function writePersistedCache<T>(key: string, payload: T, ttlMs: number): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      `${PERSISTED_CACHE_PREFIX}${key}`,
      JSON.stringify({
        expiresAt: Date.now() + ttlMs,
        payload,
      }),
    );
  } catch {
    // ignore storage issues
  }
}

function clearPersistedCache(match?: string): void {
  if (typeof window === "undefined") return;

  try {
    const keysToDelete: string[] = [];

    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index);
      if (!key?.startsWith(PERSISTED_CACHE_PREFIX)) continue;

      if (!match || key.includes(match)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => window.sessionStorage.removeItem(key));
  } catch {
    // ignore storage issues
  }
}

function clearApiCache(match?: string): void {
  if (!match) {
    responseCache.clear();
    inFlightRequests.clear();
    clearPersistedCache();
    return;
  }

  for (const key of responseCache.keys()) {
    if (key.includes(match)) {
      responseCache.delete(key);
    }
  }

  for (const key of inFlightRequests.keys()) {
    if (key.includes(match)) {
      inFlightRequests.delete(key);
    }
  }

  clearPersistedCache(match);
}

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
  skill_items?: ProfileSkillItemPayload[] | null;
  social_links: Record<string, string | null> | null;
  profile_photo?: string | null;
  photo_url: string | null;
};

export type ProfileSkillItemPayload = {
  id: number;
  name: string;
  category: string | null;
};

export type SkillOptionPayload = {
  id: number;
  name: string;
  category: string | null;
  group: "skills" | "tools" | "areas" | "Otros";
  subcategory: string | null;
};

export type SkillOptionsPayload = {
  items: SkillOptionPayload[];
  grouped: {
    skills: SkillOptionPayload[];
    tools: SkillOptionPayload[];
    areas: SkillOptionPayload[];
  };
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

export type CatalogPortfolioItem = {
  id: number;
  category_id: number | null;
  category: string | null;
  title: string;
  description: string | null;
  image_path: string | null;
  image_url: string | null;
  external_url: string | null;
  project_order: number;
  is_featured: boolean;
  created_at: string | null;
};

export type RecommendationPayload = {
  recommendations: RecommendedFreelancerItem[];
};

type RequestOptions = RequestInit & {
  token?: string;
  cacheKey?: string;
  cacheTtlMs?: number;
  skipCache?: boolean;
};

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const method = (options.method ?? "GET").toUpperCase();
  const cacheKey = buildCacheKey(path, options.token, options.cacheKey);
  const shouldUseCache =
    method === "GET" &&
    !options.skipCache &&
    typeof options.cacheTtlMs === "number" &&
    options.cacheTtlMs > 0;

  if (shouldUseCache) {
    const cached = responseCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.payload as ApiResponse<T>;
    }

    const persisted = readPersistedCache<ApiResponse<T>>(cacheKey);
    if (persisted) {
      responseCache.set(cacheKey, {
        expiresAt: Date.now() + (options.cacheTtlMs ?? 0),
        payload: persisted,
      });

      return persisted;
    }

    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) {
      return inFlight as Promise<ApiResponse<T>>;
    }
  }

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const request = (async () => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    const payload = (await response.json()) as ApiResponse<T>;

    if (!response.ok) {
      throw payload;
    }

    if (shouldUseCache) {
      responseCache.set(cacheKey, {
        expiresAt: Date.now() + (options.cacheTtlMs ?? 0),
        payload,
      });
      writePersistedCache(cacheKey, payload, options.cacheTtlMs ?? 0);
    }

    return payload;
  })();

  if (shouldUseCache) {
    inFlightRequests.set(cacheKey, request);
  }

  try {
    return await request;
  } finally {
    if (shouldUseCache) {
      inFlightRequests.delete(cacheKey);
    }
  }
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
    }).then((payload) => {
      clearApiCache();
      return payload;
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
    }).then((payload) => {
      clearApiCache();
      return payload;
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
    }).then((payload) => {
      clearApiCache();
      return payload;
    }),
  getProfile: (token: string) =>
    apiRequest<ProfilePayload>("/profile", {
      token,
      cacheKey: `profile:${token.slice(-12)}`,
      cacheTtlMs: 5 * 60 * 1000,
    }),
  getSkillOptions: (token: string) =>
    apiRequest<SkillOptionsPayload>("/profile/skill-options", {
      token,
      cacheKey: "profile:skill-options",
      cacheTtlMs: 30 * 60 * 1000,
    }),
  saveProfile: (token: string, body: Partial<ProfilePayload>) =>
    apiRequest<ProfilePayload>("/profile", {
      method: "PUT",
      token,
      body: JSON.stringify(body),
    }).then((payload) => {
      clearApiCache("profile:");
      return payload;
    }),
  updateSkills: (token: string, skills: Array<{ id: number }>) =>
    apiRequest<ProfilePayload>("/profile/skills", {
      method: "PATCH",
      token,
      body: JSON.stringify({ skills }),
    }).then((payload) => {
      clearApiCache("profile:");
      clearApiCache("catalog");
      clearApiCache("recommendations:");
      return payload;
    }),
  updateDescription: (token: string, description: string) =>
    apiRequest<ProfilePayload>("/profile/description", {
      method: "PATCH",
      token,
      body: JSON.stringify({ description }),
    }).then((payload) => {
      clearApiCache("profile:");
      clearApiCache("catalog");
      clearApiCache("recommendations:");
      return payload;
    }),
  updateSocialLinks: (token: string, social_links: Record<string, string | null>) =>
    apiRequest<ProfilePayload>("/profile/social-links", {
      method: "PATCH",
      token,
      body: JSON.stringify({ social_links }),
    }).then((payload) => {
      clearApiCache("profile:");
      clearApiCache("catalog");
      return payload;
    }),
  updatePhoto: (token: string, photo: File) => {
    const body = new FormData();
    body.append("photo", photo);

    return apiRequest<ProfilePayload>("/profile/photo", {
      method: "POST",
      token,
      body,
    }).then((payload) => {
      clearApiCache("profile:");
      clearApiCache("catalog");
      clearApiCache("favorites:");
      clearApiCache("services");
      clearApiCache("recommendations:");
      return payload;
    });
  },
  getCategories: (token: string) =>
    apiRequest<CategoryPayload[]>("/catalog/categories", {
      token,
      cacheKey: "catalog:categories",
      cacheTtlMs: 30 * 60 * 1000,
    }),
  getFreelancerServices: (token: string) =>
    apiRequest<ServicePayload[]>("/freelancer/services", {
      token,
      cacheKey: `freelancer:services:${token.slice(-12)}`,
      cacheTtlMs: 60 * 1000,
    }),
  createService: (token: string, body: ServiceInput) =>
    apiRequest<ServicePayload>("/freelancer/services", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }).then((payload) => {
      clearApiCache("freelancer:services:");
      clearApiCache("services");
      return payload;
    }),
  updateService: (token: string, id: number, body: ServiceInput) =>
    apiRequest<ServicePayload>(`/freelancer/services/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(body),
    }).then((payload) => {
      clearApiCache("freelancer:services:");
      clearApiCache("services");
      return payload;
    }),
  deleteService: (token: string, id: number) =>
    apiRequest<null>(`/freelancer/services/${id}`, {
      method: "DELETE",
      token,
    }).then((payload) => {
      clearApiCache("freelancer:services:");
      clearApiCache("services");
      return payload;
    }),
  getPortfolioProjects: (token: string) =>
    apiRequest<PortfolioProjectPayload[]>("/freelancer/portfolio", {
      token,
      cacheKey: `freelancer:portfolio:${token.slice(-12)}`,
      cacheTtlMs: 60 * 1000,
    }),
  createPortfolioProject: (token: string, body: FormData) =>
    apiRequest<PortfolioProjectPayload>("/freelancer/portfolio", {
      method: "POST",
      token,
      body,
    }).then((payload) => {
      clearApiCache("freelancer:portfolio:");
      clearApiCache("catalog:");
      clearApiCache("catalog:item:");
      return payload;
    }),
  updatePortfolioProject: (token: string, id: number, body: FormData) =>
    apiRequest<PortfolioProjectPayload>(`/freelancer/portfolio/${id}`, {
      method: "POST",
      token,
      body,
    }).then((payload) => {
      clearApiCache("freelancer:portfolio:");
      clearApiCache("catalog:");
      clearApiCache("catalog:item:");
      return payload;
    }),
  deletePortfolioProject: (token: string, id: number) =>
    apiRequest<null>(`/freelancer/portfolio/${id}`, {
      method: "DELETE",
      token,
    }).then((payload) => {
      clearApiCache("freelancer:portfolio:");
      clearApiCache("catalog:");
      clearApiCache("catalog:item:");
      return payload;
    }),
  getFreelancerRecommendations: (token: string, params?: Record<string, string | number>) => {
    const queryParams = new URLSearchParams({ type: "freelancer" });

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== "") queryParams.set(key, String(value));
      });
    }

    return apiRequest<RecommendationPayload>(`/recommendations?${queryParams.toString()}`, {
      token,
      cacheKey: `recommendations:${queryParams.toString()}:${token.slice(-12)}`,
      cacheTtlMs: 60 * 1000,
    });
  },
  analyzeFreelancer: (
    token: string,
    data: {
      skills: string[];
      tools: string[];
      description: string;
      linkedin: string;
      instagram: string;
      website: string;
      areas: string[];
      certificates: string[];
      has_project_experience?: "si" | "no";
      projects?: {
        name?: string;
        title?: string;
        description?: string;
        time?: string;
        estimated_time?: string;
      }[];
      availability?: "si" | "no";
      availability_time?: string;
      freelance_goals?: string;
    },
  ) =>
    apiRequest<GeminiAnalysisPayload>("/gemini/analyze", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  getCatalog: (token: string, params?: Record<string, string | number>) => {
    const query = params
      ? "?" + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
      : "";

    return apiRequest<CatalogPayload>(`/catalog${query}`, {
      token,
      cacheKey: `catalog${query}:${token.slice(-12)}`,
      cacheTtlMs: 60 * 1000,
    });
  },

  getCatalogItem: (token: string, id: number) =>
    apiRequest<FreelancerDetailPayload>(`/catalog/${id}`, {
      token,
      cacheKey: `catalog:item:${id}:${token.slice(-12)}`,
      cacheTtlMs: 2 * 60 * 1000,
    }),

  getMarketplaceServices: (token: string, params?: Record<string, string | number>) => {
    const query = params
      ? "?" + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
      : "";

    return apiRequest<ServicesPayload>(`/services${query}`, {
      token,
      cacheKey: `services${query}:${token.slice(-12)}`,
      cacheTtlMs: 60 * 1000,
    });
  },

  getServiceItem: (token: string, id: number) =>
    apiRequest<ServiceItem>(`/services/${id}`, {
      token,
      cacheKey: `services:item:${id}:${token.slice(-12)}`,
      cacheTtlMs: 2 * 60 * 1000,
    }),

  getFavorites: (token: string) =>
    apiRequest<FavoritesPayload>("/favorites", {
      token,
      cacheKey: `favorites:${token.slice(-12)}`,
      cacheTtlMs: 60 * 1000,
    }),

  addFavorite: (token: string, freelancerProfileId: number) =>
    apiRequest<{ favorite: FreelancerItem }>("/favorites", {
      method: "POST",
      token,
      body: JSON.stringify({ freelancer_profile_id: freelancerProfileId }),
    }).then((payload) => {
      clearApiCache("favorites:");
      return payload;
    }),

  removeFavorite: (token: string, freelancerProfileId: number) =>
    apiRequest<null>(`/favorites/${freelancerProfileId}`, {
      method: "DELETE",
      token,
    }).then((payload) => {
      clearApiCache("favorites:");
      return payload;
    }),
};

export type GeminiAnalysisPayload = {
  headline: string;
  category: string;
  suggested_rate: string;
  bio: string;
  profile_criteria?: {
    positioning?: string | null;
    target_clients?: string[];
    service_keywords?: string[];
    portfolio_focus?: string[];
    pricing_notes?: string | null;
  };
  suggested_projects: {
    title: string;
    description: string;
    estimated_time?: string | null;
    tasks?: string[];
  }[];
  tips: string[];
  strengths?: string[];
  availability_summary?: string | null;
};

export type FreelancerItem = {
  id: number;
  user_id: number;
  name: string;
  headline: string | null;
  category: string | null;
  bio: string | null;
  suggested_rate: string | null;
  rate_amount: number | null;
  location: string | null;
  experience_area: string | null;
  rating: number;
  completed_jobs: number;
  profile_photo: string | null;
  photo_url?: string | null;
  skills: string[];
  availability_status: string | null;
};

export type FreelancerDetailPayload = FreelancerItem & {
  website: string | null;
  social_links: Record<string, string | null> | null;
  portfolio: CatalogPortfolioItem[];
};

export type RecommendedFreelancerItem = FreelancerItem & {
  score: number;
  reasons: string[];
};

export type CatalogPayload = {
  freelancers: FreelancerItem[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
};

export type FavoritesPayload = {
  favorites: FreelancerItem[];
};

export type ServiceItem = {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  delivery_days: number;
  status: string;
  views_count: number;
  category: string | null;
  freelancer: {
    id: number | null;
    user_id: number | null;
    name: string;
    headline: string | null;
    rating: number | string | null;
    completed_jobs: number | null;
    profile_photo: string | null;
    photo_url?: string | null;
    skills: string[];
  };
  created_at: string;
};

export type ServicesPayload = {
  services: ServiceItem[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
};
