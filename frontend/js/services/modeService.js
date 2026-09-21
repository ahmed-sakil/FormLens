import { getSession } from '../auth/authService.js';
const MODE_KEY = 'formlens_mode';
export function setMode(mode) { sessionStorage.setItem(MODE_KEY, mode); }
export function getMode() { return sessionStorage.getItem(MODE_KEY); }
export function isGuest() { return getMode() === 'guest'; }
export function isRegistered() { return getMode() === 'registered'; }
export async function detectAndSetMode() {
  const session = await getSession().catch(() => null);
  if (session) {
    setMode('registered');
    return 'registered';
  }
  if (!getMode()) {
    setMode('guest');
  }
  return getMode();
}
