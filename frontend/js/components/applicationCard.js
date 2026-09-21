import { createElement } from '../utils/domUtils.js';
import { createDeadlineIndicator } from './deadlineIndicator.js';
import { createProgressBar } from './progressBar.js';

export function createApplicationCard(application, readiness) {
  return createElement('a', { href: `application.html?id=${application.id}`, className: 'card application-card' },
    createElement('div', { className: 'card-header' },
      createElement('h3', { className: 'application-card-title' }, application.title),
      createElement('span', { className: 'badge badge-category' }, application.category)
    ),
    createElement('div', { className: 'card-body' },
      createElement('div', { style: 'margin-bottom: var(--space-4)' },
        createElement('div', { style: 'display: flex; justify-content: space-between; font-size: var(--font-size-sm); margin-bottom: var(--space-1)' },
          createElement('span', {}, 'Readiness'),
          createElement('span', { style: 'font-weight: 500' }, `${readiness.percentage}%`)
        ),
        createProgressBar(readiness.percentage)
      ),
      createDeadlineIndicator(application.deadline)
    )
  );
}
