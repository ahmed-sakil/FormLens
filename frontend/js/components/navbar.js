import { isGuest } from '../services/modeService.js';
import { getUser, logout } from '../auth/authService.js';
import { createElement, $, $$ } from '../utils/domUtils.js';

export async function renderNavbar() {
  const guest = isGuest();
  let rightContent;
  
  if (guest) {
    rightContent = createElement('div', { className: 'navbar-right' },
      createElement('span', { className: 'local-mode-badge' }, 'Local Mode'),
      createElement('a', { href: 'register.html', className: 'btn btn-primary btn-sm' }, 'Sign Up')
    );
  } else {
    rightContent = createElement('div', { className: 'navbar-right' },
      createElement('button', { 
        className: 'btn btn-secondary btn-sm', 
        onclick: async () => { await logout(); window.location.href = 'login.html'; } 
      }, 'Logout')
    );
  }

  return createElement('header', { className: 'navbar' },
    createElement('div', { className: 'navbar-left' }, 
      createElement('button', { className: 'mobile-menu-btn', 'aria-label': 'Open navigation menu' }, '☰')
    ),
    rightContent
  );
}

function renderMobileBottomNav() {
  const currentPath = window.location.pathname.toLowerCase();
  
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: 'dashboard.html',
      isActive: currentPath.endsWith('dashboard.html') || currentPath.endsWith('/dashboard') || currentPath === '/' || currentPath.endsWith('/index.html'),
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`
    },
    {
      id: 'applications',
      label: 'Applications',
      href: 'applications.html',
      isActive: currentPath.includes('application'),
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
    },
    {
      id: 'profile',
      label: 'Profile',
      href: 'profile.html',
      isActive: currentPath.includes('profile'),
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
    },
    {
      id: 'settings',
      label: 'Settings',
      href: 'settings.html',
      isActive: currentPath.includes('settings'),
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
    }
  ];

  const nav = createElement('nav', { className: 'mobile-bottom-nav', 'aria-label': 'Mobile Navigation' });
  
  navItems.forEach(item => {
    const link = createElement('a', {
      href: item.href,
      className: `mobile-bottom-item ${item.isActive ? 'active' : ''}`,
      'aria-label': item.label
    });
    link.innerHTML = `
      <span class="mobile-bottom-icon">${item.icon}</span>
      <span class="mobile-bottom-label">${item.label}</span>
    `;
    nav.appendChild(link);
  });

  return nav;
}

export async function initNavbar() {
  const container = document.getElementById('navbar-container');
  if (container) {
    container.appendChild(await renderNavbar());
    
    // Inject Mobile Bottom Navigation if not already present
    if (!$('.mobile-bottom-nav')) {
      const bottomNav = renderMobileBottomNav();
      document.body.appendChild(bottomNav);
    }

    // Create Backdrop for Mobile Drawer
    let backdrop = $('.sidebar-backdrop');
    if (!backdrop) {
      backdrop = createElement('div', { className: 'sidebar-backdrop' });
      document.body.appendChild(backdrop);
    }

    const sidebar = $('.sidebar');
    
    // Add close button to sidebar header on mobile if missing
    if (sidebar) {
      const sidebarHeader = $('.sidebar-header', sidebar);
      if (sidebarHeader && !$('.sidebar-close-btn', sidebarHeader)) {
        const closeBtn = createElement('button', { 
          className: 'sidebar-close-btn', 
          'aria-label': 'Close navigation menu',
          onclick: () => closeSidebar()
        }, '✕');
        sidebarHeader.appendChild(closeBtn);
      }
    }

    function openSidebar() {
      sidebar?.classList.add('open');
      backdrop?.classList.add('active');
    }

    function closeSidebar() {
      sidebar?.classList.remove('open');
      backdrop?.classList.remove('active');
    }

    const menuBtn = $('.mobile-menu-btn', container);
    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        if (sidebar?.classList.contains('open')) closeSidebar();
        else openSidebar();
      });
    }

    backdrop?.addEventListener('click', closeSidebar);

    // Auto close sidebar when a link is clicked on mobile
    $$('.sidebar-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 900) closeSidebar();
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar?.classList.contains('open')) {
        closeSidebar();
      }
    });
  }
}
