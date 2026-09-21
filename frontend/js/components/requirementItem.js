import { createElement } from '../utils/domUtils.js';

export function createRequirementItem(requirement, { onToggle, onEdit, onDelete }) {
  const isChecked = requirement.completed;
  
  const checkbox = createElement('input', { 
    type: 'checkbox', 
    className: 'checkbox-input', 
    checked: isChecked,
    onchange: (e) => onToggle(e.target.checked)
  });
  
  const title = createElement('span', { className: 'requirement-title' }, requirement.title);
  const badge = createElement('span', { className: `badge ${requirement.required ? 'badge-required' : 'badge-optional'}` }, requirement.required ? 'Required' : 'Optional');
  
  const content = createElement('div', { className: 'requirement-content' },
    createElement('div', { style: 'display: flex; align-items: center; gap: var(--space-2)' }, title, badge),
    requirement.description ? createElement('div', { style: 'font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-1)' }, requirement.description) : ''
  );
  
  const actions = createElement('div', { className: 'requirement-actions' },
    createElement('button', { className: 'btn btn-ghost btn-sm', onclick: onEdit }, 'Edit'),
    createElement('button', { className: 'btn btn-ghost btn-sm', onclick: onDelete, style: 'color: var(--color-danger)' }, 'Delete')
  );
  
  return createElement('div', { className: `requirement-item ${isChecked ? 'completed' : ''}` },
    checkbox, content, actions
  );
}
