import { login, resendConfirmation, logout } from '../auth/authService.js';
import { requireGuest } from '../auth/authGuard.js';
import { validateLoginForm } from '../validation/authSchema.js';
import { showFieldError, clearAllErrors } from '../utils/validationUtils.js';
import { $, setLoading } from '../utils/domUtils.js';
import { setMode } from '../services/modeService.js';
import { apiFetch } from '../api/apiClient.js';
import { toast } from '../components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const errContainer = $('#error-container');
  
  if (urlParams.get('expired')) {
    try { await logout(); } catch {}
    setMode('guest');
    if (errContainer) {
      errContainer.innerHTML = 'Your session has expired. Please sign in again.';
      errContainer.classList.remove('hidden');
    }
  }

  await requireGuest();

  const form = $('#login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors(form);
    if (errContainer) {
      errContainer.innerHTML = '';
      errContainer.classList.add('hidden');
    }
    
    const email = $('#email')?.value?.trim();
    const password = $('#password')?.value;
    
    const errors = validateLoginForm({ email, password });
    if (Object.keys(errors).length > 0) {
      if (errors.email) showFieldError($('#email'), errors.email);
      if (errors.password) showFieldError($('#password'), errors.password);
      return;
    }
    
    const submitBtn = $('button[type="submit"]', form);
    setLoading(submitBtn, true, 'Signing in...');
    
    try {
      const authData = await login(email, password);
      
      if (!authData?.session) {
        throw new Error('Email not confirmed');
      }

      setMode('registered');

      // Sync backend profile (non-fatal)
      try {
        await apiFetch('/auth/profile-sync', { method: 'POST' });
      } catch (syncErr) {
        console.warn('Profile sync notice:', syncErr.message);
      }

      window.location.href = 'dashboard.html';
    } catch (error) {
      setLoading(submitBtn, false);
      const rawMsg = (error.message || '').toLowerCase();
      
      if (errContainer) {
        errContainer.classList.remove('hidden');
        
        // 1. Email not confirmed / pending verification
        if (rawMsg.includes('email not confirmed') || rawMsg.includes('not confirmed') || rawMsg.includes('unconfirmed')) {
          errContainer.innerHTML = `
            <div style="font-weight: 700; margin-bottom: var(--space-1);">⚠️ Email Not Verified</div>
            <p style="margin-bottom: var(--space-2); font-size: var(--font-size-xs);">Your account is waiting for email confirmation. Please check your inbox (and spam folder).</p>
            <button type="button" id="btn-resend-link" class="btn btn-secondary btn-xs" style="margin-top: 4px;">
              Resend Confirmation Email
            </button>
          `;
          
          $('#btn-resend-link')?.addEventListener('click', async () => {
            try {
              await resendConfirmation(email);
              toast.success('Confirmation email re-sent! Check your inbox.');
            } catch (rErr) {
              toast.error('Failed to resend confirmation email.');
            }
          });
          return;
        }

        // 2. Invalid Credentials
        if (rawMsg.includes('invalid login credentials') || rawMsg.includes('invalid_grant')) {
          errContainer.textContent = 'Incorrect email or password. Please verify your credentials and try again.';
          return;
        }

        // 3. User not found
        if (rawMsg.includes('user not found') || rawMsg.includes('no user')) {
          errContainer.innerHTML = 'No account found with this email. <a href="register.html" style="text-decoration: underline; color: inherit; font-weight: 600;">Create an account</a>';
          return;
        }

        // 4. Rate Limiting / Too Many Attempts
        if (rawMsg.includes('too many requests') || rawMsg.includes('rate limit') || error.status === 429) {
          errContainer.textContent = 'Too many sign-in attempts. Please wait a few moments and try again.';
          return;
        }

        // 5. Network & Fetch Failures
        if (rawMsg.includes('failed to fetch') || rawMsg.includes('networkerror') || rawMsg.includes('network')) {
          errContainer.textContent = 'Cannot connect to authentication service. Please check your internet connection.';
          return;
        }

        // Fallback friendly message
        errContainer.textContent = error.message || 'Unable to sign in. Please try again.';
      }
    }
  });
});
