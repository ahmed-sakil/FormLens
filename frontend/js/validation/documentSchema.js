import { validateRequired } from '../utils/validationUtils.js';
export function validateDocumentForm({ type }) {
  const errors = {};
  const typeErr = validateRequired(type, 'Type'); if (typeErr) errors.type = typeErr;
  return errors;
}
