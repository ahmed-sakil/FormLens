import { createElement } from '../utils/domUtils.js';
export function createProgressBar(percentage) {
  return createElement('div', { className: 'progress-wrapper' },
    createElement('div', { className: 'progress-bar' },
      createElement('div', { className: 'progress-fill', style: `width: ${percentage}%` })
    )
  );
}
