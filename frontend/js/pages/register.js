import { register } from '../auth/authService.js';
import { requireGuest } from '../auth/authGuard.js';
import { validateRegisterForm } from '../validation/authSchema.js';
import { showFieldError, clearAllErrors } from '../utils/validationUtils.js';
import { $, setLoading } from '../utils/domUtils.js';
import { setMode } from '../services/modeService.js';
import { hasData, getAllData, clearAll } from '../storage/guestStorage.js';
import { migrateToAccount, getLocalDataSummary } from '../services/migrationService.js';
import { apiFetch } from '../api/apiClient.js';
import { toast } from '../components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  await requireGuest();

  const form = $('#register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors(form);

    const errContainer = $('#error-container');
    if (errContainer) errContainer.classList.add('hidden');

    const name = $('#name')?.value?.trim();
    const email = $('#email')?.value?.trim();
    const password = $('#password')?.value;
    const confirmPassword = $('#confirm-password')?.value;

    const errors = validateRegisterForm({ name, email, password, confirmPassword });
    if (Object.keys(errors).length > 0) {
      if (errors.name) showFieldError($('#name'), errors.name);
      if (errors.email) showFieldError($('#email'), errors.email);
      if (errors.password) showFieldError($('#password'), errors.password);
      if (errors.confirmPassword) showFieldError($('#confirm-password'), errors.confirmPassword);
      return;
    }

    const submitBtn = $('button[type="submit"]', form);
    setLoading(submitBtn, true, 'Creating Account...');

    try {
      // 1. Create Supabase account
      const authData = await register(name, email, password);

      // Check if Supabase requires email confirmation (session is null)
      if (authData?.user && !authData?.session) {
        showConfirmationSuccessScreen(email);
        return;
      }

      // If user is immediately logged in with session:
      setMode('registered');

      // 2. Ensure backend Profile record exists
      try {
        await apiFetch('/auth/profile-sync', { method: 'POST' });
      } catch (syncErr) {
        console.warn('Profile sync warning:', syncErr.message);
      }

      // 3. Check for local guest data and prompt migration
      if (hasData()) {
        const summary = getLocalDataSummary();
        const doMigrate = await showMigrationPrompt(summary);

        if (doMigrate) {
          setLoading(submitBtn, true, 'Migrating data...');
          try {
            await migrateToAccount();
            toast.success(`Imported ${summary.applicationCount} applications successfully.`);
          } catch (migErr) {
            toast.error('Migration failed. Your local data is still preserved.');
            console.error('Migration failed:', migErr);
          }
        } else {
          clearAll();
        }
      }

      window.location.href = 'dashboard.html';
    } catch (error) {
      if (errContainer) {
        let msg = error.message || 'Failed to create account. Please try again.';
        if (msg.includes('User already registered') || msg.includes('already registered')) {
          msg = 'An account with this email already exists. Please sign in or reset your password.';
        } else if (msg.includes('Password should be at least')) {
          msg = 'Password is too weak. Please use at least 8 characters.';
        }
        errContainer.textContent = msg;
        errContainer.classList.remove('hidden');
      }
      setLoading(submitBtn, false);
    }
  });
});

/**
 * Replaces the registration form with a friendly confirmation email screen
 */
function showConfirmationSuccessScreen(email) {
  const panel = document.querySelector('.auth-form-panel');
  if (!panel) return;

  panel.innerHTML = `
    <div style="text-align: center; padding: var(--space-4) 0; animation: pageFadeIn 0.35s ease forwards;">
      <div style="font-size: 3.5rem; margin-bottom: var(--space-4);">📬</div>
      <h1 style="font-size: var(--font-size-2xl); font-weight: 800; margin-bottom: var(--space-3); color: var(--color-text-primary);">
        Check Your Email
      </h1>
      <p style="color: var(--color-text-secondary); font-size: var(--font-size-base); line-height: 1.6; margin-bottom: var(--space-4);">
        We have sent a verification link to:
      </p>
      <div style="background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius); padding: var(--space-3) var(--space-4); font-weight: 700; color: var(--color-accent-blue); margin-bottom: var(--space-6); word-break: break-all;">
        ${email}
      </div>
      <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); line-height: 1.6; margin-bottom: var(--space-6);">
        Please click the confirmation link in the email to activate your account. Once confirmed, you can sign in and start organizing your applications.
      </p>
      <div style="display: flex; flex-direction: column; gap: var(--space-3);">
        <a href="login.html" class="btn btn-primary btn-lg" style="width: 100%;">
          Proceed to Sign In &rarr;
        </a>
        <a href="index.html" class="btn btn-ghost btn-sm">
          Return to Home
        </a>
      </div>
    </div>
  `;
}

/**
 * Shows a migration prompt modal
 */
function showMigrationPrompt(summary) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = 'background:var(--color-surface-elevated);border:1px solid var(--color-border-strong);border-radius:var(--radius-xl);padding:var(--space-8);max-width:460px;width:90%;box-shadow:var(--shadow-lg);';
    modal.innerHTML = `
      <h2 style="margin-bottom:var(--space-3);font-size:var(--font-size-xl);font-weight:700;">Import Local Data?</h2>
      <p style="color:var(--color-text-secondary);margin-bottom:var(--space-4);font-size:var(--font-size-sm);">We found existing applications saved in this browser:</p>
      <div style="background:var(--color-surface-2);border-radius:var(--radius);padding:var(--space-4);margin-bottom:var(--space-6);">
        <div style="font-weight:700;color:var(--color-text-primary);">${summary.applicationCount} application${summary.applicationCount !== 1 ? 's' : ''}</div>
        <div style="color:var(--color-text-secondary);font-size:var(--font-size-sm);">${summary.requirementCount} requirement${summary.requirementCount !== 1 ? 's' : ''}</div>
      </div>
      <p style="color:var(--color-text-secondary);font-size:var(--font-size-sm);margin-bottom:var(--space-6);">Would you like to sync this data with your new account?</p>
      <div style="display:flex;gap:var(--space-3);justify-content:flex-end;">
        <button id="migration-skip" class="btn btn-secondary">Start Fresh</button>
        <button id="migration-import" class="btn btn-primary">Import Data</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    modal.querySelector('#migration-import').addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve(true);
    });
    modal.querySelector('#migration-skip').addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve(false);
    });
  });
}
