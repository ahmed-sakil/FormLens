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

export async function initNavbar() {
  const container = document.getElementById('navbar-container');
  if (container) {
    container.appendChild(await renderNavbar());
    
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
