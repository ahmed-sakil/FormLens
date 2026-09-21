import { initGuestMode, requireGuest } from '../auth/authGuard.js';
import { initNavbar } from '../components/navbar.js';

document.addEventListener('DOMContentLoaded', async () => {
  await requireGuest();
  await initNavbar();

  // Both CTA buttons trigger guest mode
  ['continue-guest', 'try-guest'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => initGuestMode());
  });
});
