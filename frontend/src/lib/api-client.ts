import { TestData, User, CreateUserDto } from '@/types/api.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Token storage ────────────────────────────────────────────────────────────

const ACCESS_KEY = 'sft_access_token';
const REFRESH_KEY = 'sft_refresh_token';

export const tokenStore = {
  getAccess: (): string | null => {
    try { return localStorage.getItem(ACCESS_KEY); } catch { return null; }
  },
  getRefresh: (): string | null => {
    try { return localStorage.getItem(REFRESH_KEY); } catch { return null; }
  },
  set: (access: string, refresh: string) => {
    try {
      localStorage.setItem(ACCESS_KEY, access);
      localStorage.setItem(REFRESH_KEY, refresh);
    } catch { /* ignore */ }
  },
  updateAccess: (access: string) => {
    try { localStorage.setItem(ACCESS_KEY, access); } catch { /* ignore */ }
  },
  clear: () => {
    try {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    } catch { /* ignore */ }
  },
};

// Called when both tokens are expired — lets the app force-logout
let unauthorizedCallback: (() => void) | null = null;
export function setUnauthorizedCallback(cb: () => void) {
  unauthorizedCallback = cb;
}

// ─── Core fetch with auto-refresh ─────────────────────────────────────────────

// 401 from these endpoints means bad credentials / bad refresh token,
// not an expired access token — never trigger the silent refresh flow
const NO_REFRESH_ENDPOINTS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = tokenStore.getAccess();

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  // Try silent token refresh on 401
  if (res.status === 401 && !NO_REFRESH_ENDPOINTS.includes(endpoint)) {
    const refreshToken = tokenStore.getRefresh();
    if (refreshToken) {
      const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const { accessToken } = await refreshRes.json();
        tokenStore.updateAccess(accessToken);

        // Retry original request with new token
        const retried = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            ...options?.headers,
          },
        });

        if (!retried.ok) {
          const err = await retried.json().catch(() => ({ message: `HTTP ${retried.status}` }));
          throw new ApiError(err.message || 'An error occurred', retried.status);
        }
        if (retried.status === 204) return undefined as T;
        return retried.json();
      }
    }

    // Both tokens invalid — force logout
    tokenStore.clear();
    unauthorizedCallback?.();
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new ApiError(err.message || 'An error occurred', res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthUser = { id: number; name: string; email: string; createdAt: string };
export type AuthResponse = { user: AuthUser; accessToken: string; refreshToken: string };
export type FastingSessionDto = { id: number; userId: number; start: number; end: number; duration: number; createdAt: string };

// ─── API client ───────────────────────────────────────────────────────────────

export const apiClient = {
  test: {
    getTestData: (): Promise<TestData> => fetchApi<TestData>('/api/test'),
  },
  users: {
    getAll: (): Promise<User[]> => fetchApi<User[]>('/api/users'),
    create: (data: CreateUserDto): Promise<User> =>
      fetchApi<User>('/api/users', { method: 'POST', body: JSON.stringify(data) }),
  },
  auth: {
    register: (data: { name: string; email: string; password: string }): Promise<AuthResponse> =>
      fetchApi<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }): Promise<AuthResponse> =>
      fetchApi<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: (): Promise<void> =>
      fetchApi<void>('/api/auth/logout', { method: 'POST' }),
  },
  fasting: {
    getAll: (): Promise<FastingSessionDto[]> =>
      fetchApi<FastingSessionDto[]>('/api/fasting'),
    create: (data: { start: number; end: number; duration: number }): Promise<FastingSessionDto> =>
      fetchApi<FastingSessionDto>('/api/fasting', { method: 'POST', body: JSON.stringify(data) }),
    clearAll: (): Promise<void> =>
      fetchApi<void>('/api/fasting', { method: 'DELETE' }),
    remove: (id: number): Promise<void> =>
      fetchApi<void>(`/api/fasting/${id}`, { method: 'DELETE' }),
  },
};
