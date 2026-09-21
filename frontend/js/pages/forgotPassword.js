import { forgotPassword } from '../auth/authService.js';
import { requireGuest } from '../auth/authGuard.js';
import { validateEmail, showFieldError, clearAllErrors } from '../utils/validationUtils.js';
import { $, setLoading, show, hide } from '../utils/domUtils.js';

document.addEventListener('DOMContentLoaded', async () => {
  await requireGuest();

  const form = $('#forgot-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors(form);
    
    const emailInput = $('#email');
    const email = emailInput.value;
    const emailErr = validateEmail(email);
    
    if (emailErr) {
      showFieldError(emailInput, emailErr);
      return;
    }
    
    const submitBtn = $('button[type="submit"]', form);
    setLoading(submitBtn, true, 'Sending...');
    
    try {
      await forgotPassword(email);
      hide(form);
      show($('#success-message'));
    } catch (error) {
      showFieldError(emailInput, error.message || 'Something went wrong.');
      setLoading(submitBtn, false);
    }
  });
});
