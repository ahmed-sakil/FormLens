import { validateRequired } from '../utils/validationUtils.js';
export function validateRequirementForm({ title }) {
  const errors = {};
  const titleErr = validateRequired(title, 'Title'); if (titleErr) errors.title = titleErr;
  return errors;
}
