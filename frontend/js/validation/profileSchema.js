import { validateRequired } from '../utils/validationUtils.js';
export function validateProfileForm({ name }) {
  const errors = {};
  const nameErr = validateRequired(name, 'Name'); if (nameErr) errors.name = nameErr;
  return errors;
}
