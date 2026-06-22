import * as SecureStore from 'expo-secure-store';

// Same backend that powers the web app (deployed on Railway).
export const API_URL = 'https://halo-backend-production-8e78.up.railway.app';

export class ApiError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

// ─── Token storage (SecureStore replaces the web's localStorage) ──────────────

const ACCESS_KEY = 'sftAccessToken';
const REFRESH_KEY = 'sftRefreshToken';

export const tokenStore = {
  getAccess: () => SecureStore.getItemAsync(ACCESS_KEY),
  getRefresh: () => SecureStore.getItemAsync(REFRESH_KEY),
  async set(access: string, refresh: string) {
    await SecureStore.setItemAsync(ACCESS_KEY, access);
    await SecureStore.setItemAsync(REFRESH_KEY, refresh);
  },
  updateAccess: (access: string) => SecureStore.setItemAsync(ACCESS_KEY, access),
  async clear() {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  },
};

// Small key/value store for non-sensitive local state (active fast, goal).
export const storage = {
  get: (key: string) => SecureStore.getItemAsync(key),
  set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  del: (key: string) => SecureStore.deleteItemAsync(key),
};

// Called when both tokens are expired — lets the app force-logout.
let onUnauthorized: (() => void) | null = null;
export const setUnauthorized = (cb: () => void) => {
  onUnauthorized = cb;
};

// ─── Core fetch with auto-refresh ─────────────────────────────────────────────

const NO_REFRESH = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await tokenStore.getAccess();

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401 && !NO_REFRESH.includes(endpoint)) {
    const refresh = await tokenStore.getRefresh();
    if (refresh) {
      const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
      });

      if (refreshRes.ok) {
        const { accessToken } = await refreshRes.json();
        await tokenStore.updateAccess(accessToken);

        const retried = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            ...(options.headers || {}),
          },
        });

        if (!retried.ok) {
          const e = await retried.json().catch(() => ({ message: `HTTP ${retried.status}` }));
          throw new ApiError(e.message || 'An error occurred', retried.status);
        }
        return retried.status === 204 ? (undefined as T) : retried.json();
      }
    }

    await tokenStore.clear();
    onUnauthorized?.();
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new ApiError(e.message || 'An error occurred', res.status);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthUser = { id: number; name: string; email: string; createdAt: string };
export type AuthResponse = { user: AuthUser; accessToken: string; refreshToken: string };
export type FastingSessionDto = {
  id: number;
  userId: number;
  start: number;
  end: number;
  duration: number;
  createdAt: string;
};

// ─── API client ───────────────────────────────────────────────────────────────

export const api = {
  auth: {
    register: (d: { name: string; email: string; password: string }) =>
      fetchApi<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(d) }),
    login: (d: { email: string; password: string }) =>
      fetchApi<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(d) }),
    logout: () => fetchApi<void>('/api/auth/logout', { method: 'POST' }),
  },
  users: {
    me: () => fetchApi<AuthUser>('/api/users/me'),
  },
  fasting: {
    getAll: () => fetchApi<FastingSessionDto[]>('/api/fasting'),
    create: (d: { start: number; end: number; duration: number }) =>
      fetchApi<FastingSessionDto>('/api/fasting', { method: 'POST', body: JSON.stringify(d) }),
    clearAll: () => fetchApi<void>('/api/fasting', { method: 'DELETE' }),
  },
};
