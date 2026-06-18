const API_URL = import.meta.env.VITE_API_URL ?? "https://skill-to-money-backend.onrender.com/api";

export const API_BASE_URL = API_URL;
export const API_ROOT_URL = API_URL.replace(/\/api\/?$/, "");

const responseCache = new Map<string, { expiresAt: number; payload: unknown }>();
const inFlightRequests = new Map<string, Promise<unknown>>();
const PERSISTED_CACHE_PREFIX = "skill-to-money:api-cache:v2:";

export function resolveAssetUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  if (/^(https?:|data:|blob:)/i.test(value)) {
    if (typeof window !== "undefined" && window.location.protocol === "https:" && value.startsWith("http://")) {
      return value.replace(/^http:\/\//i, "https://");
    }

    return value;
  }

  const normalizedRoot = API_ROOT_URL.replace(/\/$/, "");
  const cleanPath = value.replace(/^\/+/, "");
  const normalizedPath = cleanPath.startsWith("api/media/")
    ? `/${cleanPath}`
    : `/api/media/${cleanPath}`;

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
  email_verified_at?: string | null;
  subscription_plan?: "free" | "pro";
  subscription_status?: string | null;
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
  headline?: string | null;
  category?: string | null;
  suggested_rate?: string | null;
  bio: string | null;
  description: string | null;
  location: string | null;
  contact_phone?: string | null;
  website: string | null;
  availability_status?: string | null;
  rating?: string | null;
  completed_jobs?: number | null;
  visibility_score?: string | number | null;
  visibility?: VisibilityPayload | null;
  skills: string[] | null;
  skill_items?: ProfileSkillItemPayload[] | null;
  social_links: Record<string, string | null> | null;
  profile_photo?: string | null;
  photo_url: string | null;
  gemini_analysis?: GeminiAnalysisPayload | null;
  services_count?: number | null;
  portfolio_projects_count?: number | null;
};

export type VisibilityPayload = {
  score: number;
  level: "Alta" | "Media" | "Baja" | string;
  tier: "Oro" | "Plata" | "Bronce" | string;
  checks: {
    label: string;
    done: boolean;
    points: number;
  }[];
  missing: string[];
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

export type ClientProjectPayload = {
  id: number;
  title: string;
  category: string | null;
  description: string;
  budget_min: string | null;
  budget_max: string | null;
  expected_delivery_days: number | null;
  status: "draft" | "published" | "in_progress" | "completed" | "cancelled";
  progress: number;
  views_count: number;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
};

export type ClientProjectInput = {
  title: string;
  category: string | null;
  description: string;
  budget_min: string | null;
  budget_max: string | null;
  expected_delivery_days: number | null;
  status: ClientProjectPayload["status"];
  progress?: number;
  ai_generated?: boolean;
};

export type ClientProjectsPayload = {
  projects: ClientProjectPayload[];
  limits: {
    plan: "free" | "pro";
    max_projects: number | null;
    can_create: boolean;
  };
};

export type MypeSummaryPayload = {
  id: number | null;
  name: string;
  business_name: string | null;
  industry: string | null;
  description: string | null;
  website: string | null;
  location: string | null;
  profile_photo: string | null;
  views_count: number | null;
};

export type ClientProjectDetailPayload = ClientProjectPayload & {
  mype: MypeSummaryPayload;
};

export type PublicClientProjectsPayload = {
  projects: ClientProjectDetailPayload[];
  total: number;
};

export type MypeDetailPayload = MypeSummaryPayload & {
  id: number;
  user_id: number;
  projects: ClientProjectPayload[];
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

export type CompatibilityBreakdownPayload = {
  skills?: {
    weight: number;
    points: number;
    requested: string[];
    matched: string[];
  };
  category?: {
    weight: number;
    points: number;
    matched: boolean;
    requested: string | null;
    profile_value: string | null;
  };
  rating?: {
    weight: number;
    points: number;
    value: number;
  };
  experience?: {
    weight: number;
    points: number;
    completed_jobs: number;
  };
  price_range?: {
    matched: boolean | null;
    rate_amount: number | null;
    budget_min: number | null;
    budget_max: number | null;
  };
};

export type MarketTrendItem = {
  label: string;
  demand_count: number;
  average_budget: number | null;
  min_budget: number | null;
  max_budget: number | null;
  currency: string;
  sample_projects: {
    id: number;
    title: string;
    category: string | null;
  }[];
};

export type MarketTrendsPayload = {
  trends: MarketTrendItem[];
  has_data: boolean;
  keywords: string[];
};

export type PriceSuggestionPayload = {
  has_data: boolean;
  sample_count: number;
  recommended_min: number | null;
  recommended_max: number | null;
  average_price: number | null;
  currency: string;
  source?: string;
};

export type PortfolioHealthPayload = {
  score: number;
  level: string;
  signals: {
    has_photo: boolean;
    has_description: boolean;
    projects_count: number;
    skills_count: number;
    has_headline: boolean;
  };
  recommendations: string[];
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

export type ConversationItem = {
  id: number;
  other_user: {
    id: number;
    name: string;
    photo_url: string | null;
  };
  last_message: string;
  last_message_at: string;
  unread_count: number;
  service_id: number | null;
  status: string;
  created_at: string;
};

export type MessageItem = {
  id: number;
  conversation_id: number;
  sender: {
    id: number;
    name: string;
  } | null;
  is_mine: boolean;
  message: string;
  read_at: string | null;
  created_at: string;
};

export type NotificationItem = {
  id: number;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
};

export type UnreadCountPayload = {
  messages: number;
  notifications: number;
  total: number;
};

export type SubscriptionPaymentPayload = {
  id: number;
  reference: string;
  plan: "pro";
  amount: number;
  currency: "PEN";
  payment_method: "card" | "yape" | "plin";
  card_brand: string | null;
  card_last_four: string | null;
  status: "succeeded";
  saved_for_renewal: boolean;
  paid_at: string | null;
};

export type SubscriptionPayload = {
  plan: "free" | "pro";
  status: string;
  billing_cycle: "monthly" | "yearly" | null;
  amount: number;
  currency: "PEN";
  starts_at: string | null;
  ends_at: string | null;
  features: string[];
  last_payment: SubscriptionPaymentPayload | null;
  payment?: SubscriptionPaymentPayload;
};

export type SubscriptionCheckoutInput = {
  plan: "pro";
  billing_cycle: "monthly" | "yearly";
  payment_method: "card" | "yape" | "plin";
  save_payment_method?: boolean;
  payment_details: {
    card_number?: string;
    card_holder?: string;
    expiry_month?: number;
    expiry_year?: number;
    cvv?: string;
    phone?: string;
    culqi_token?: string;
    culqi_email?: string;
    device_finger_print_id?: string;
    authentication_3ds?: {
      eci?: string;
      xid?: string;
      cavv?: string;
      protocolVersion?: string;
      directoryServerTransactionId?: string;
    };
  };
};

export type ContractStatus =
  | "pending_payment"
  | "in_escrow"
  | "in_progress"
  | "submitted_for_review"
  | "revision_requested"
  | "approved"
  | "released"
  | "disputed"
  | "cancelled";

export type ContractFilePayload = {
  id: number;
  original_name: string;
  mime_type: string | null;
  size: number | null;
  is_preview: boolean;
  is_final: boolean;
  downloadable: boolean;
  watermark_text: string | null;
  download_url: string;
};

export type ContractDeliveryPayload = {
  id: number;
  title: string | null;
  message: string | null;
  status: string;
  revision_round: number;
  submitted_at: string | null;
  reviewed_at: string | null;
  review_comment: string | null;
  files: ContractFilePayload[];
  created_at: string;
};

export type ContractPayload = {
  id: number;
  contract_number: string;
  title: string;
  description: string | null;
  amount: number;
  currency: string;
  status: ContractStatus;
  provider: string;
  terms: Record<string, unknown> | null;
  mype: {
    id: number | null;
    name: string | null;
    user_id: number | null;
  };
  freelancer: {
    id: number | null;
    user_id: number | null;
    name: string | null;
    headline: string | null;
    skills: string[];
  };
  service: {
    id: number;
    title: string;
    category: string | null;
  } | null;
  client_project: {
    id: number;
    title: string;
    category: string | null;
  } | null;
  payment: {
    id: number;
    status: string;
    provider: string;
    paid_at: string | null;
  } | null;
  escrow: {
    id: number;
    status: string;
    amount: number;
    currency: string;
    held_at: string | null;
    released_at: string | null;
    refunded_at: string | null;
  } | null;
  deliveries: ContractDeliveryPayload[];
  disputes: {
    id: number;
    status: string;
    reason: string;
    resolution: string | null;
    admin_comment: string | null;
    resolved_at: string | null;
    created_at: string;
  }[];
  created_at: string;
  updated_at: string;
  started_at: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  released_at: string | null;
};

export type ContractsPayload = {
  contracts: ContractPayload[];
};

export type CreateContractInput = {
  freelancer_profile_id: number;
  service_id?: number | null;
  client_project_id?: number | null;
  title: string;
  description?: string | null;
  amount: number;
  currency?: string;
  terms?: Record<string, unknown> | null;
};

export type WalletPayload = {
  wallet: {
    id: number;
    available_balance: number;
    pending_balance: number;
    escrow_balance: number;
    currency: string;
    transactions: {
      id: number;
      contract_id: number | null;
      type: string;
      direction: "credit" | "debit" | string;
      amount: number;
      currency: string;
      available_after: number;
      description: string | null;
      created_at: string;
    }[];
    withdrawals: {
      id: number;
      amount: number;
      currency: string;
      provider: string;
      status: string;
      requested_at: string | null;
      processed_at: string | null;
    }[];
  };
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
  verifyEmail: (body: { email: string; token: string }) =>
    apiRequest<AuthPayload>("/auth/verify-email", {
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
  getSubscription: (token: string) =>
    apiRequest<SubscriptionPayload>("/subscription", {
      token,
      cacheKey: `subscription:${token.slice(-12)}`,
      cacheTtlMs: 60 * 1000,
    }),
  checkoutSubscription: (token: string, body: SubscriptionCheckoutInput) =>
    apiRequest<SubscriptionPayload>("/subscription/checkout", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }).then((payload) => {
      clearApiCache("subscription:");
      clearApiCache("client:projects:");
      return payload;
    }),
  getContracts: (token: string) =>
    apiRequest<ContractsPayload>("/contracts", {
      token,
      skipCache: true,
    }),
  getContract: (token: string, id: number) =>
    apiRequest<ContractPayload>(`/contracts/${id}`, {
      token,
      skipCache: true,
    }),
  createContract: (token: string, body: CreateContractInput) =>
    apiRequest<ContractPayload>("/contracts", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }).then((payload) => {
      clearApiCache("contracts");
      return payload;
    }),
  mockPayContract: (token: string, id: number) =>
    apiRequest<ContractPayload>(`/contracts/${id}/mock-pay`, {
      method: "POST",
      token,
    }),
  deliverContract: (token: string, id: number, body: FormData) =>
    apiRequest<ContractPayload>(`/contracts/${id}/deliver`, {
      method: "POST",
      token,
      body,
    }),
  requestContractRevision: (token: string, id: number, comment: string) =>
    apiRequest<ContractPayload>(`/contracts/${id}/request-revision`, {
      method: "POST",
      token,
      body: JSON.stringify({ comment }),
    }),
  approveContract: (token: string, id: number) =>
    apiRequest<ContractPayload>(`/contracts/${id}/approve`, {
      method: "POST",
      token,
    }),
  disputeContract: (token: string, id: number, reason: string) =>
    apiRequest<ContractPayload>(`/contracts/${id}/dispute`, {
      method: "POST",
      token,
      body: JSON.stringify({ reason }),
    }),
  getWallet: (token: string) =>
    apiRequest<WalletPayload>("/wallet", {
      token,
      skipCache: true,
    }),
  requestWithdrawal: (token: string, body: { amount: number; method?: string; destination?: string }) =>
    apiRequest<WalletPayload>("/wallet/withdrawals", {
      method: "POST",
      token,
      body: JSON.stringify(body),
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
      clearApiCache("market:portfolio-health:");
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
      clearApiCache("market:portfolio-health:");
      return payload;
    }),
  deleteService: (token: string, id: number) =>
    apiRequest<null>(`/freelancer/services/${id}`, {
      method: "DELETE",
      token,
    }).then((payload) => {
      clearApiCache("freelancer:services:");
      clearApiCache("services");
      clearApiCache("market:portfolio-health:");
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
      clearApiCache("market:portfolio-health:");
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
      clearApiCache("market:portfolio-health:");
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
      clearApiCache("market:portfolio-health:");
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
  getMarketTrends: (token: string) =>
    apiRequest<MarketTrendsPayload>("/market/trends", {
      token,
      cacheKey: `market:trends:${token.slice(-12)}`,
      cacheTtlMs: 60 * 1000,
    }),

  getPriceSuggestion: (token: string, params?: Record<string, string | number>) => {
    const query = params
      ? "?" + new URLSearchParams(Object.entries(params).map(([key, value]) => [key, String(value)])).toString()
      : "";

    return apiRequest<PriceSuggestionPayload>(`/market/price-suggestion${query}`, {
      token,
      cacheKey: `market:price:${query}:${token.slice(-12)}`,
      cacheTtlMs: 60 * 1000,
    });
  },
  getPortfolioHealth: (token: string) =>
    apiRequest<PortfolioHealthPayload>("/market/portfolio-health", {
      token,
      cacheKey: `market:portfolio-health:${token.slice(-12)}`,
      cacheTtlMs: 60 * 1000,
    }),
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
        tools?: string[];
        category?: string;
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
      skipCache: true,
    }),

  getMypeItem: (token: string, id: number) =>
    apiRequest<MypeDetailPayload>(`/mypes/${id}`, {
      token,
      skipCache: true,
    }),

  getClientProjectItem: (token: string, id: number) =>
    apiRequest<ClientProjectDetailPayload>(`/client-projects/${id}`, {
      token,
      skipCache: true,
    }),

  getPublicClientProjects: (token: string, params?: Record<string, string | number>) => {
    const query = params
      ? "?" + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
      : "";

    return apiRequest<PublicClientProjectsPayload>(`/client-projects${query}`, {
      token,
      cacheKey: `client-projects${query}:${token.slice(-12)}`,
      cacheTtlMs: 60 * 1000,
    });
  },

  getClientProjects: (token: string) =>
    apiRequest<ClientProjectsPayload>("/client/projects", {
      token,
      cacheKey: `client:projects:${token.slice(-12)}`,
      cacheTtlMs: 60 * 1000,
    }),

  createClientProject: (token: string, body: ClientProjectInput) =>
    apiRequest<ClientProjectPayload>("/client/projects", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }).then((payload) => {
      clearApiCache("client:projects:");
      clearApiCache("market:");
      return payload;
    }),

  updateClientProject: (token: string, id: number, body: ClientProjectInput) =>
    apiRequest<ClientProjectPayload>(`/client/projects/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(body),
    }).then((payload) => {
      clearApiCache("client:projects:");
      clearApiCache("market:");
      return payload;
    }),

  deleteClientProject: (token: string, id: number) =>
    apiRequest<null>(`/client/projects/${id}`, {
      method: "DELETE",
      token,
    }).then((payload) => {
      clearApiCache("client:projects:");
      clearApiCache("market:");
      return payload;
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

  getConversations: (token: string) =>
    apiRequest<{ conversations: ConversationItem[] }>("/messaging/conversations", {
      token,
      skipCache: true,
    }),

  createConversation: (token: string, body: { freelancer_profile_id?: number; mype_profile_id?: number; message: string }) =>
    apiRequest<{ conversation: ConversationItem; message: MessageItem }>("/messaging/conversations", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }),

  getConversation: (token: string, id: number) =>
    apiRequest<{ conversation: ConversationItem; messages: MessageItem[] }>(`/messaging/conversations/${id}`, {
      token,
      skipCache: true,
    }),

  sendMessage: (token: string, conversationId: number, message: string) =>
    apiRequest<{ message: MessageItem }>(`/messaging/conversations/${conversationId}/messages`, {
      method: "POST",
      token,
      body: JSON.stringify({ message }),
    }),

  markConversationRead: (token: string, conversationId: number) =>
    apiRequest<null>(`/messaging/conversations/${conversationId}/read`, {
      method: "PUT",
      token,
    }),

  getUnreadCount: (token: string) =>
    apiRequest<UnreadCountPayload>("/messaging/unread-count", {
      token,
      skipCache: true,
    }),

  getNotifications: (token: string) =>
    apiRequest<{ notifications: NotificationItem[] }>("/messaging/notifications", {
      token,
      skipCache: true,
    }),

  markNotificationRead: (token: string, id: number) =>
    apiRequest<null>(`/messaging/notifications/${id}/read`, {
      method: "PUT",
      token,
    }),

  markAllNotificationsRead: (token: string) =>
    apiRequest<null>("/messaging/notifications/read-all", {
      method: "PUT",
      token,
    }),
};

export type GeminiAnalysisPayload = {
  titulo_profesional?: string | null;
  descripcion_profesional?: string | null;
  propuesta_valor?: string | null;
  skills_destacadas?: string[];
  herramientas_destacadas?: string[];
  proyectos_optimizados?: {
    nombre: string | null;
    descripcion_mejorada: string | null;
    categoria: string | null;
    herramientas: string[];
  }[];
  servicios_recomendados?: {
    nombre: string | null;
    descripcion: string | null;
    precio_sugerido: string | null;
    tiempo_entrega: string | null;
    categoria: string | null;
  }[];
  recomendaciones_mejora?: string[];
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
  views_count?: number | null;
  visibility_score?: number | string | null;
  visibility_level?: string | null;
};

export type FreelancerDetailPayload = FreelancerItem & {
  website: string | null;
  social_links: Record<string, string | null> | null;
  portfolio: CatalogPortfolioItem[];
  services: Array<{
    id: number;
    title: string;
    description: string;
    price: number;
    currency: string;
    delivery_days: number;
    status: string;
    views_count: number;
    category: string | null;
  }>;
};

export type RecommendedFreelancerItem = FreelancerItem & {
  score: number;
  compatibility_score?: number;
  compatibility_level?: string;
  compatibility_breakdown?: CompatibilityBreakdownPayload;
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
