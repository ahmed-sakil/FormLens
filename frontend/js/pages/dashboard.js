import { initNavbar } from '../components/navbar.js';
import { getApplications, getReadiness } from '../services/applicationService.js';
import { isGuest } from '../services/modeService.js';
import { getUser } from '../auth/authService.js';
import { $, createElement } from '../utils/domUtils.js';
import { createApplicationCard } from '../components/applicationCard.js';
import { daysUntil } from '../utils/dateUtils.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initNavbar();
  
  if (isGuest()) {
    const banner = createElement('div', { className: 'local-mode-banner' },
      createElement('span', {}, 'You are using Local Mode. Data is stored on this device only.'),
      createElement('a', { href: 'register.html', className: 'btn btn-primary btn-sm' }, 'Sync Data')
    );
    $('.main-content')?.insertBefore(banner, $('.page-content'));
  } else {
    getUser().then(user => {
      const name = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
      if (name && $('#greeting-heading')) {
        $('#greeting-heading').textContent = `Hello, ${name} 👋`;
      }
    }).catch(() => {});
  }

  const upcomingContainer = $('#upcoming-deadlines');
  const recentContainer = $('#recent-applications');

  // Render Skeleton Placeholders while loading
  if (upcomingContainer) upcomingContainer.innerHTML = '<div class="skeleton" style="height: 90px; border-radius: var(--radius-lg);"></div>';
  if (recentContainer) recentContainer.innerHTML = '<div class="skeleton" style="height: 90px; border-radius: var(--radius-lg);"></div>';

  try {
    const apps = await getApplications();
    const activeApps = (apps || []).filter(a => a.status === 'ACTIVE');
    
    let readyCount = 0;
    let attentionCount = 0;
    const readinessMap = {};
    
    for (const app of activeApps) {
      try {
        const r = await getReadiness(app.id);
        readinessMap[app.id] = r || { percentage: 0, ready: false };
        if (r?.ready) readyCount++;
        else if (r?.percentage < 50) attentionCount++;
      } catch (err) {
        readinessMap[app.id] = { percentage: 0, ready: false };
      }
    }
    
    if ($('#stat-total')) $('#stat-total').textContent = apps.length;
    if ($('#stat-active')) $('#stat-active').textContent = activeApps.length;
    if ($('#stat-ready')) $('#stat-ready').textContent = readyCount;
    if ($('#stat-attention')) $('#stat-attention').textContent = attentionCount;
    
    // 1. Upcoming Deadlines
    const upcoming = activeApps.filter(a => {
      if (!a.deadline) return false;
      const days = daysUntil(a.deadline);
      return days >= 0 && days <= 30;
    }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    
    if (upcomingContainer) {
      upcomingContainer.innerHTML = '';
      if (upcoming.length === 0) {
        upcomingContainer.innerHTML = `
          <div class="empty-state" style="padding: var(--space-6);">
            <p style="color: var(--color-text-muted); font-size: var(--font-size-sm); margin: 0;">No deadlines due in the next 30 days.</p>
          </div>
        `;
      } else {
        upcoming.forEach(app => {
          upcomingContainer.appendChild(createApplicationCard(app, readinessMap[app.id] || { percentage: 0 }));
        });
      }
    }
    
    // 2. Recent Applications
    const recent = [...apps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    
    if (recentContainer) {
      recentContainer.innerHTML = '';
      if (recent.length === 0) {
        recentContainer.innerHTML = `
          <div class="empty-state" style="padding: var(--space-6);">
            <p style="color: var(--color-text-muted); font-size: var(--font-size-sm); margin-bottom: var(--space-3);">No applications yet.</p>
            <a href="applications.html" class="btn btn-primary btn-sm">+ Create Application</a>
          </div>
        `;
      } else {
        recent.forEach(app => {
          const r = readinessMap[app.id] || { percentage: 0 };
          recentContainer.appendChild(createApplicationCard(app, r));
        });
      }
    }
    
  } catch (error) {
    console.error('Error loading dashboard:', error);
    if (upcomingContainer) upcomingContainer.innerHTML = '<p class="text-muted" style="font-size: var(--font-size-sm);">Failed to load deadlines.</p>';
    if (recentContainer) recentContainer.innerHTML = '<p class="text-muted" style="font-size: var(--font-size-sm);">Failed to load applications.</p>';
  }
});
