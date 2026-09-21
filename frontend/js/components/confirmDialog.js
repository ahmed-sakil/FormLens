import { createElement, $ } from '../utils/domUtils.js';
import { createModal, openModal, closeModal } from './modal.js';

let dialogCount = 0;

export function confirmDialog({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', danger = false }) {
  return new Promise((resolve) => {
    const id = `confirm-dialog-${dialogCount++}`;
    
    const body = createElement('p', {}, message);
    
    const footer = createElement('div', { style: 'display: flex; gap: var(--space-2); justify-content: flex-end;' },
      createElement('button', { className: 'btn btn-secondary', onclick: () => { closeModal(id); resolve(false); } }, cancelText),
      createElement('button', { className: `btn ${danger ? 'btn-danger' : 'btn-primary'}`, onclick: () => { closeModal(id); resolve(true); } }, confirmText)
    );
    
    const modal = createModal({ id, title, body, footer });
    document.body.appendChild(modal);
    
    openModal(id);
    
    // Cleanup after close
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' && !modal.classList.contains('open')) {
          setTimeout(() => { if (modal.parentNode) modal.parentNode.removeChild(modal); }, 300);
          observer.disconnect();
        }
      });
    });
    observer.observe(modal, { attributes: true });
  });
}
