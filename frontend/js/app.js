import { getTheme } from './storage/settingsStorage.js';
import { detectAndSetMode } from './services/modeService.js';

// Apply theme immediately on initial execution to prevent any theme flickering
function applyTheme() {
  const theme = getTheme();
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

applyTheme();

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (getTheme() === 'system') {
    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  }
});

// Silence benign browser View Transition abort warnings (thrown by Chromium when navigations overlap)
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason?.name === 'AbortError' ||
    (typeof event.reason?.message === 'string' && event.reason.message.includes('Transition was skipped'))
  ) {
    event.preventDefault();
  }
});

// Setup Smooth Page Transitions across internal links
function setupPageTransitions() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Ignore anchors, external links, javascript: void, or new tabs
    if (
      href.startsWith('#') ||
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:') ||
      href.startsWith('javascript:') ||
      link.getAttribute('target') === '_blank' ||
      e.ctrlKey || e.metaKey || e.shiftKey
    ) {
      return;
    }

    // Only intercept internal HTML pages
    if (href.endsWith('.html') || href.includes('.html?')) {
      e.preventDefault();
      document.body.classList.add('page-exiting');
      
      setTimeout(() => {
        window.location.href = href;
      }, 200);
    }
  });

  // Handle bfcache when navigating back/forward
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      document.body.classList.remove('page-exiting');
    }
  });
}

// Initialize app basics
document.addEventListener('DOMContentLoaded', async () => {
  setupPageTransitions();
  await detectAndSetMode();
});
