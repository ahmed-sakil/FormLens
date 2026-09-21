import { createElement } from '../utils/domUtils.js';
export function createStatusBadge(status) {
  let className = 'badge ';
  if (status === 'ACTIVE') className += 'badge-active';
  else if (status === 'COMPLETED') className += 'badge-completed';
  else if (status === 'ARCHIVED') className += 'badge-archived';
  return createElement('span', { className }, status);
}
