// FormLens Toast Notification System
// Works seamlessly with Sonner (if loaded) or falls back to custom elegant DOM toasts

function showFallbackToast(message, type = 'info') {
  let container = document.getElementById('fl-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'fl-toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 99999;
      pointer-events: none;
      max-width: 360px;
      width: calc(100% - 48px);
    `;
    document.body.appendChild(container);
  }

  const toastEl = document.createElement('div');
  toastEl.className = `fl-toast fl-toast-${type}`;
  
  const borderColors = {
    success: 'var(--color-success, #16a34a)',
    error: 'var(--color-danger, #dc2626)',
    info: 'var(--color-accent-2, #4f46e5)',
    loading: 'var(--color-border-strong, #9ca3af)'
  };

  toastEl.style.cssText = `
    background: var(--color-surface, #ffffff);
    color: var(--color-text-primary, #111827);
    border: 1px solid var(--color-border, #e5e7eb);
    border-left: 4px solid ${borderColors[type] || borderColors.info};
    border-radius: var(--radius, 8px);
    padding: 12px 16px;
    font-size: var(--font-size-sm, 14px);
    font-family: inherit;
    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1));
    pointer-events: auto;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 200ms ease, transform 200ms ease;
  `;
  toastEl.textContent = message;
  container.appendChild(toastEl);

  // Trigger animation
  requestAnimationFrame(() => {
    toastEl.style.opacity = '1';
    toastEl.style.transform = 'translateY(0)';
  });

  // Auto remove after 3.5s
  setTimeout(() => {
    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateY(8px)';
    setTimeout(() => toastEl.remove(), 250);
  }, 3500);
}

function getSonnerToast() {
  if (window.toast && typeof window.toast.success === 'function') return window.toast;
  if (window.sonner && typeof window.sonner.success === 'function') return window.sonner;
  if (window.Sonner && typeof window.Sonner.toast === 'function') return window.Sonner.toast;
  return null;
}

export const toast = {
  success: (msg) => {
    const s = getSonnerToast();
    if (s?.success) s.success(msg);
    else showFallbackToast(msg, 'success');
  },
  error: (msg) => {
    const s = getSonnerToast();
    if (s?.error) s.error(msg);
    else showFallbackToast(msg, 'error');
  },
  info: (msg) => {
    const s = getSonnerToast();
    if (s?.message || s?.info) (s.message || s.info)(msg);
    else showFallbackToast(msg, 'info');
  },
  loading: (msg) => {
    const s = getSonnerToast();
    if (s?.loading) return s.loading(msg);
    showFallbackToast(msg, 'loading');
    return null;
  },
};
