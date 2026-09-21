import { getToken, logout, getSession } from '../auth/authService.js';
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
      const session = await getSession().catch(() => null);
      const now = Math.floor(Date.now() / 1000);
      
      // Only redirect if the Supabase session is genuinely expired or missing
      if (!session || (session.expires_at && session.expires_at < now)) {
        try {
          await logout();
        } catch {}
        setMode('guest');
        window.location.href = 'login.html?expired=1';
      } else {
        console.warn('Backend 401 response while Supabase session is active');
      }
    }
    throw new ApiError('UNAUTHORIZED', 'Authentication failed or session expired.', 401);
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
