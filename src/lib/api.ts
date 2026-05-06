/**
 * EduCost AI — Typed API Client
 * Handles auth token storage, auto-refresh on 401, and all backend endpoint calls.
 */

const API_BASE = '/api/v1';

// ── Token helpers ──────────────────────────────────────────────────────────────

const TOKEN_KEY = 'ec_access_token';
const REFRESH_KEY = 'ec_refresh_token';

export const tokenStore = {
  getAccess: () => (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null),
  getRefresh: () => (typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null),
  set: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ── Core fetch wrapper ─────────────────────────────────────────────────────────

type FetchOptions = RequestInit & { skipAuth?: boolean };

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuth = false, ...init } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = tokenStore.getAccess();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  // Auto-refresh on 401
  if (res.status === 401 && !skipAuth) {
    const refreshed = await tryRefreshTokens();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${tokenStore.getAccess()}`;
      res = await fetch(`${API_BASE}${path}`, { ...init, headers });
    } else {
      tokenStore.clear();
      window.location.href = '/login';
      throw new ApiError('Session expired. Please login again.', 401);
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.message || `Request failed: ${res.status}`, res.status, body);
  }

  const json = await res.json();
  return json.data ?? json;
}

async function tryRefreshTokens(): Promise<boolean> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const json = await res.json();
    const data = json.data ?? json;
    tokenStore.set(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Auth ────────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
      skipAuth: true,
    }),

  login: (body: { email: string; password: string }) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
      skipAuth: true,
    }),

  refresh: (refreshToken: string) =>
    apiFetch<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      skipAuth: true,
    }),
};

// ── Calculations ────────────────────────────────────────────────────────────────

export interface CostInput {
  tuitionPerYear: number;
  duration: number;
  rent: number;
  food: number;
  transport: number;
  insurance: number;
  equipment?: number;
  misc?: number;
  inflation?: number;
}

export interface CostResult {
  totalTuition: number;
  livingCost: number;
  hiddenCost: number;
  grandTotal: number;
  yearlyBreakdown: Array<{
    year: number;
    tuition: number;
    living: number;
    equipment: number;
    misc: number;
    subtotal: number;
  }>;
}

export interface LoanInput {
  principal: number;
  annualInterestRate: number;
  tenureYears: number;
  moratoriumMonths?: number;
}

export interface LoanResult {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  principalWithMoratorium: number;
  effectiveInterestRate: number;
  amortizationSchedule: Array<{
    period: string;
    month: number;
    emi: number;
    principalPaid: number;
    interestPaid: number;
    balance: number;
  }>;
}

export interface ROIInput {
  expectedSalary: number;
  salaryGrowthRate?: number;
  placementProbability?: number;
  loanAmount: number;
  annualInterestRate: number;
  tenureYears: number;
  totalCost: number;
  moratoriumMonths?: number;
}

export interface ROIResult {
  debtIncomeRatio: number;
  repaymentYears: number;
  breakEvenYear: number | string;
  stressScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  annualEmi: number;
  riskAdjustedSalary: number;
  loanSummary: LoanResult;
}

export const calcApi = {
  cost: (body: CostInput) =>
    apiFetch<CostResult>('/calculate/cost', { method: 'POST', body: JSON.stringify(body) }),

  loan: (body: LoanInput) =>
    apiFetch<LoanResult>('/calculate/loan', { method: 'POST', body: JSON.stringify(body) }),

  roi: (body: ROIInput) =>
    apiFetch<ROIResult>('/calculate/roi', { method: 'POST', body: JSON.stringify(body) }),
};

// ── Simulations ─────────────────────────────────────────────────────────────────

export interface SimulationInput {
  tuitionPerYear: number;
  duration: number;
  rent: number;
  food: number;
  transport: number;
  insurance: number;
  loanAmount: number;
  annualInterestRate: number;
  tenureYears: number;
  expectedSalary: number;
  moratoriumMonths?: number;
  placementProbability?: number;
  salaryGrowthRate?: number;
  equipment?: number;
  misc?: number;
}

export interface SimulationRecord {
  id: string;
  inputsJson: SimulationInput;
  outputsJson: ROIResult & { cost: CostResult };
  createdAt: string;
}

export const simulationApi = {
  run: (body: SimulationInput) =>
    apiFetch<SimulationRecord>('/simulate', { method: 'POST', body: JSON.stringify(body) }),

  getAll: () =>
    apiFetch<SimulationRecord[]>('/simulate'),
};

// ── Reports ─────────────────────────────────────────────────────────────────────

export interface ReportRecord {
  id: string;
  title: string;
  type: string;
  payloadJson: Record<string, unknown>;
  createdAt: string;
}

export const reportsApi = {
  create: (body: { title: string; type: string; payload: Record<string, unknown> }) =>
    apiFetch<ReportRecord>('/reports', { method: 'POST', body: JSON.stringify(body) }),

  getAll: () =>
    apiFetch<ReportRecord[]>('/reports'),

  getOne: (id: string) =>
    apiFetch<ReportRecord>(`/reports/${id}`),

  delete: (id: string) =>
    apiFetch<{ deleted: boolean }>(`/reports/${id}`, { method: 'DELETE' }),
};

// ── AI Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
  history: ChatMessage[];
}

export const aiApi = {
  chat: (message: string, context?: Record<string, unknown>) =>
    apiFetch<ChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    }),

  getHistory: () =>
    apiFetch<ChatMessage[]>('/ai/history'),

  clearHistory: () =>
    apiFetch<{ cleared: boolean }>('/ai/history', { method: 'DELETE' }),
};

// ── Colleges ─────────────────────────────────────────────────────────────────────

export interface College {
  id: string;
  name: string;
  country: string;
  city: string;
  degreeTypes: string[];
  tuitionAvg: number;
  placementRate: number;
  avgSalary: number;
  ranking?: number;
  tags: string[];
  currency: string;
}

export const collegesApi = {
  search: (params: { country?: string; degreeType?: string; maxTuition?: number }) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      )
    ).toString();
    return apiFetch<College[]>(`/colleges${qs ? `?${qs}` : ''}`);
  },
};

// ── User ──────────────────────────────────────────────────────────────────────────

export interface UserProfile {
  studentType: 'DOMESTIC' | 'INTERNATIONAL' | 'ONLINE';
  country?: string;
  currency: string;
  familyIncome?: number;
}

export const userApi = {
  me: () => apiFetch<AuthUser>('/user/me'),

  updateProfile: (body: Partial<UserProfile>) =>
    apiFetch<UserProfile>('/user/profile', { method: 'PUT', body: JSON.stringify(body) }),

  getProfile: () =>
    apiFetch<UserProfile>('/user/profile'),
};
