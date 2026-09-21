import { createElement, $, $$ } from '../utils/domUtils.js';

export function openModal(id) {
  const overlay = $(`#${id}`);
  if (overlay) {
    overlay.classList.add('open');
    const firstInput = $('input', overlay);
    if (firstInput) firstInput.focus();
  }
}

export function closeModal(id) {
  const overlay = $(`#${id}`);
  if (overlay) overlay.classList.remove('open');
}

export function createModal({ id, title, body, footer }) {
  const closeBtn = createElement('button', { className: 'modal-close', onclick: () => closeModal(id), html: '&times;' });
  
  const header = createElement('div', { className: 'modal-header' },
    createElement('h2', {}, title),
    closeBtn
  );
  
  const bodyWrapper = createElement('div', { className: 'modal-body' });
  if (typeof body === 'string') bodyWrapper.innerHTML = body;
  else bodyWrapper.appendChild(body);
  
  const footerWrapper = createElement('div', { className: 'modal-footer' });
  if (typeof footer === 'string') footerWrapper.innerHTML = footer;
  else if (footer) footerWrapper.appendChild(footer);
  
  const modalContent = createElement('div', { className: 'modal' }, header, bodyWrapper, footerWrapper);
  
  const overlay = createElement('div', { id, className: 'modal-overlay' }, modalContent);
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(id);
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal(id);
  });
  
  return overlay;
}
