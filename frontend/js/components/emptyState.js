import { createElement } from '../utils/domUtils.js';
export function createEmptyState({ title, description, actionText, onAction }) {
  const els = [
    createElement('h3', {}, title),
    createElement('p', {}, description)
  ];
  if (actionText && onAction) {
    els.push(createElement('button', { className: 'btn btn-primary', onclick: onAction }, actionText));
  }
  return createElement('div', { className: 'empty-state' }, ...els);
}
