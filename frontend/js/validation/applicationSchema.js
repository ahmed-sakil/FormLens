import { validateRequired, validateMaxLength } from '../utils/validationUtils.js';

export function validateApplicationForm({ title, category }) {
  const errors = {};
  const titleErr = validateRequired(title, 'Title'); if (titleErr) errors.title = titleErr;
  const maxErr = validateMaxLength(title, 100, 'Title'); if (maxErr) errors.title = maxErr;
  const catErr = validateRequired(category, 'Category'); if (catErr) errors.category = catErr;
  return errors;
}
