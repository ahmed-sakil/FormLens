import { initNavbar } from '../components/navbar.js';
import { getTheme, setTheme } from '../storage/settingsStorage.js';
import { isGuest } from '../services/modeService.js';
import { $, $$ } from '../utils/domUtils.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initNavbar();
  
  const currentTheme = getTheme();
  
  function updateActiveThemeCard(theme) {
    $$('.theme-card').forEach(card => {
      if (card.dataset.themeVal === theme) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  updateActiveThemeCard(currentTheme);

  $$('.theme-card').forEach(card => {
    card.addEventListener('click', () => {
      const selected = card.dataset.themeVal;
      setTheme(selected);
      updateActiveThemeCard(selected);

      if (selected === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-theme', selected);
      }
    });
  });
  
  if (isGuest()) {
    $('#guest-reminder')?.classList.remove('hidden');
  }
});
