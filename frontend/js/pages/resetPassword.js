import { resetPassword } from '../auth/authService.js';
import { validateResetPasswordForm } from '../validation/authSchema.js';
import { showFieldError, clearAllErrors } from '../utils/validationUtils.js';
import { $, setLoading } from '../utils/domUtils.js';
import { toast } from '../components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Check for hash
  if (!window.location.hash.includes('access_token')) {
    $('#error-container').textContent = 'Invalid or expired password reset link.';
    $('#error-container').classList.remove('hidden');
    $('#reset-form').classList.add('hidden');
    return;
  }

  const form = $('#reset-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors(form);
    
    const password = $('#password').value;
    const confirmPassword = $('#confirm-password').value;
    
    const errors = validateResetPasswordForm({ password, confirmPassword });
    if (Object.keys(errors).length > 0) {
      if (errors.password) showFieldError($('#password'), errors.password);
      if (errors.confirmPassword) showFieldError($('#confirm-password'), errors.confirmPassword);
      return;
    }
    
    const submitBtn = $('button[type="submit"]', form);
    setLoading(submitBtn, true, 'Updating...');
    
    try {
      await resetPassword(password);
      toast.success('Password updated successfully');
      setTimeout(() => { window.location.href = 'login.html'; }, 2000);
    } catch (error) {
      $('#error-container').textContent = error.message || 'Failed to update password.';
      $('#error-container').classList.remove('hidden');
      setLoading(submitBtn, false);
    }
  });
});
