import { getSession, logout } from './authService.js';
import { getMode, setMode, isGuest } from '../services/modeService.js';

export async function requireAuth() {
  if (isGuest()) return;
  const session = await getSession().catch(() => null);
  if (!session) {
    setMode('guest');
    window.location.href = 'login.html';
    return;
  }
  
  const now = Math.floor(Date.now() / 1000);
  if (session.expires_at && session.expires_at < now) {
    try { await logout(); } catch {}
    setMode('guest');
    window.location.href = 'login.html?expired=1';
  }
}

export async function requireGuest() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('expired')) {
    try { await logout(); } catch {}
    setMode('guest');
    return;
  }
  
  const session = await getSession().catch(() => null);
  if (session) {
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      try { await logout(); } catch {}
      setMode('guest');
      return;
    }
    if (!isGuest()) {
      window.location.href = 'dashboard.html';
    }
  }
}

export function initGuestMode() {
  setMode('guest');
  window.location.href = 'dashboard.html';
}


