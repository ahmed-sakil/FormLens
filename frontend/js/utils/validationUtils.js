export function validateRequired(value, fieldName) { return !value || value.trim() === '' ? `${fieldName} is required.` : null; }
export function validateEmail(email) { return !email || !/^[^@]+@[^@]+\.[^@]+$/.test(email) ? 'Valid email is required.' : null; }
export function validatePassword(password) { return !password || password.length < 8 ? 'Password must be at least 8 characters.' : null; }
export function validatePasswordMatch(p1, p2) { return p1 !== p2 ? 'Passwords do not match.' : null; }
export function validateMaxLength(value, max, fieldName) { return value && value.length > max ? `${fieldName} must be less than ${max} characters.` : null; }

export function showFieldError(inputEl, message) {
  if (!inputEl) return;
  inputEl.classList.add('error');
  let errEl = inputEl.parentNode.querySelector('.form-error');
  if (!errEl) {
    errEl = document.createElement('span');
    errEl.className = 'form-error';
    inputEl.parentNode.appendChild(errEl);
  }
  errEl.textContent = message;
}

export function clearFieldError(inputEl) {
  if (!inputEl) return;
  inputEl.classList.remove('error');
  const errEl = inputEl.parentNode.querySelector('.form-error');
  if (errEl) errEl.remove();
}

export function clearAllErrors(formEl) {
  const inputs = formEl.querySelectorAll('.error');
  inputs.forEach(clearFieldError);
}
