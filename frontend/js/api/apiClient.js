import { getToken, logout } from '../auth/authService.js';
import { setMode } from '../services/modeService.js';

const BASE_URL = window.ENV.API_URL;

export async function apiFetch(path, options = {}) {
  const token = await getToken();
  const response = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  
  const data = await response.json().catch(() => ({}));
  
  if (response.status === 401) {
    const isAuthPage = window.location.pathname.includes('login') || window.location.pathname.includes('register');
    if (!isAuthPage && !path.includes('/auth/')) {
      try {
        await logout();
      } catch {}
      setMode('guest');
      window.location.href = 'login.html?expired=1';
    }
    throw new ApiError('UNAUTHORIZED', 'Session invalid or expired.', 401);
  }
  
  if (response.status === 429) {
    throw new ApiError('RATE_LIMITED', 'Too many requests. Please try again later.', 429);
  }
  
  if (!response.ok) {
    throw new ApiError(
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.message || 'Something went wrong.',
      response.status
    );
  }
  
  return data.data;
}

export class ApiError extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}
