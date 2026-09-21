import { createElement } from '../utils/domUtils.js';
export function createSkeletonCard() {
  return createElement('div', { className: 'skeleton skeleton-card' });
}
