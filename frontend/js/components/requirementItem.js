import { createElement } from '../utils/domUtils.js';

export function createRequirementItem(requirement, { onToggle, onEdit, onDelete, onDocInfo, docInfo }) {
  const isChecked = requirement.completed;
  
  const checkbox = createElement('input', { 
    type: 'checkbox', 
    className: 'checkbox-input', 
    checked: isChecked,
    'aria-label': `Mark ${requirement.title} as completed`,
    onchange: (e) => onToggle(e.target.checked)
  });
  
  const title = createElement('span', { className: 'requirement-title' }, requirement.title);
  const badge = createElement('span', { 
    className: `badge ${requirement.required ? 'badge-active' : 'badge-category'}`,
    style: 'font-size: var(--font-size-xs);'
  }, requirement.required ? 'Required' : 'Optional');
  
  let docBadge = '';
  if (docInfo?.expiryDate) {
    docBadge = createElement('span', { 
      className: 'badge badge-category', 
      style: 'font-size: 10px; color: var(--color-accent-blue);' 
    }, `Exp: ${new Date(docInfo.expiryDate).toLocaleDateString()}`);
  }

  const content = createElement('div', { className: 'requirement-content' },
    createElement('div', { style: 'display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;' }, title, badge, docBadge),
    requirement.description ? createElement('div', { style: 'font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-1)' }, requirement.description) : ''
  );
  
  const actions = createElement('div', { className: 'requirement-actions' },
    createElement('button', { 
      className: 'btn btn-ghost btn-xs', 
      onclick: onDocInfo,
      title: 'Attach optional document dates or notes'
    }, docInfo ? '📄 Edit Doc Details' : '+ Doc Details (opt)'),
    createElement('button', { className: 'btn btn-ghost btn-xs', onclick: onEdit }, 'Edit'),
    createElement('button', { className: 'btn btn-ghost btn-xs', onclick: onDelete, style: 'color: var(--color-danger)' }, 'Delete')
  );
  
  return createElement('div', { className: `requirement-item ${isChecked ? 'completed' : ''}` },
    checkbox, content, actions
  );
}

