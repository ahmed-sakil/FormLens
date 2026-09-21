const SETTINGS_KEY = 'formlens_settings';
export function getTheme() { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}').theme || 'light'; }
export function setTheme(theme) {
  const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  s.theme = theme;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}
