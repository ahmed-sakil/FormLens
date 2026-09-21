import { validateRequired, validateEmail, validatePassword, validatePasswordMatch } from '../utils/validationUtils.js';

export function validateRegisterForm({ name, email, password, confirmPassword }) {
  const errors = {};
  const nameErr = validateRequired(name, 'Name'); if (nameErr) errors.name = nameErr;
  const emailErr = validateEmail(email); if (emailErr) errors.email = emailErr;
  const passErr = validatePassword(password); if (passErr) errors.password = passErr;
  const matchErr = validatePasswordMatch(password, confirmPassword); if (matchErr) errors.confirmPassword = matchErr;
  return errors;
}

export function validateLoginForm({ email, password }) {
  const errors = {};
  const emailErr = validateEmail(email); if (emailErr) errors.email = emailErr;
  const passErr = validateRequired(password, 'Password'); if (passErr) errors.password = passErr;
  return errors;
}

export function validateResetPasswordForm({ password, confirmPassword }) {
  const errors = {};
  const passErr = validatePassword(password); if (passErr) errors.password = passErr;
  const matchErr = validatePasswordMatch(password, confirmPassword); if (matchErr) errors.confirmPassword = matchErr;
  return errors;
}
