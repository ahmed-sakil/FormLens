import { initNavbar } from '../components/navbar.js';
import { requireAuth } from '../auth/authGuard.js';
import { isGuest } from '../services/modeService.js';
import { getProfile, updateProfile } from '../api/profileApi.js';
import { apiFetch } from '../api/apiClient.js';
import { $, setLoading } from '../utils/domUtils.js';
import { toast } from '../components/toast.js';
import { logout } from '../auth/authService.js';
import { clearAll } from '../storage/guestStorage.js';
import { confirmDialog } from '../components/confirmDialog.js';

document.addEventListener('DOMContentLoaded', async () => {
  await requireAuth();
  await initNavbar();

  if (isGuest()) {
    // Show Guest View
    $('#guest-profile-view')?.classList.remove('hidden');

    $('#btn-clear-guest-data')?.addEventListener('click', async () => {
      const confirmed = await confirmDialog({
        title: 'Clear Local Data?',
        message: 'This will permanently delete all applications and requirements saved in this browser.',
        danger: true,
        confirmText: 'Yes, Clear Everything'
      });
      if (confirmed) {
        clearAll();
        toast.success('Local data cleared.');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
      }
    });
    return;
  }

  // Registered View
  $('#registered-profile-view')?.classList.remove('hidden');

  let currentProfile = null;

  async function loadProfile() {
    try {
      currentProfile = await getProfile();
      if ($('#profile-name-input')) $('#profile-name-input').value = currentProfile.name || '';
      if ($('#profile-email')) $('#profile-email').textContent = currentProfile.email || '—';
      if ($('#profile-created')) $('#profile-created').textContent = currentProfile.createdAt ? new Date(currentProfile.createdAt).toLocaleDateString() : '—';
    } catch (e) {
      toast.error('Failed to load profile data.');
    }
  }

  await loadProfile();

  // Handle Name Update
  $('#profile-info-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#profile-name-input')?.value?.trim();
    if (!name) return toast.error('Name cannot be empty');

    const saveBtn = $('#btn-save-profile');
    setLoading(saveBtn, true, 'Saving...');
    try {
      await updateProfile({ name });
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(saveBtn, false);
    }
  });

  // Handle Password Change
  $('#change-password-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = $('#new-password')?.value;
    const confirmPassword = $('#confirm-password')?.value;

    if (!newPassword || newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters.');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match.');
    }

    const btn = $('#btn-change-password');
    setLoading(btn, true, 'Updating...');
    try {
      await apiFetch('/profile/change-password', {
        method: 'POST',
        body: JSON.stringify({ newPassword, confirmPassword })
      });
      toast.success('Password changed successfully.');
      $('#new-password').value = '';
      $('#confirm-password').value = '';
    } catch (err) {
      if (err.status === 429) {
        toast.error('Password was changed recently. Please wait before changing again.');
        $('#password-cooldown-notice')?.classList.remove('hidden');
      } else {
        toast.error(err.message || 'Failed to change password');
      }
    } finally {
      setLoading(btn, false);
    }
  });

  // Handle Logout
  $('#btn-logout')?.addEventListener('click', async () => {
    try {
      await logout();
      window.location.href = 'login.html';
    } catch (e) {
      toast.error('Failed to logout');
    }
  });
});
