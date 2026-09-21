export const $ = (selector, parent = document) => parent.querySelector(selector);
export const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
export function show(el) { el?.classList.remove('hidden'); }
export function hide(el) { el?.classList.add('hidden'); }
export function setLoading(btn, loading, text) {
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    if (!btn.dataset.original) btn.dataset.original = btn.innerHTML;
    btn.textContent = text || 'Loading...';
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.original || btn.textContent;
  }
}
export function createElement(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key.startsWith('on') && typeof val === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), val);
    } else if (key === 'className') {
      el.className = val;
    } else if (key === 'dataset') {
      for (const [dKey, dVal] of Object.entries(val)) el.dataset[dKey] = dVal;
    } else if (key === 'html') {
      el.innerHTML = val;
    } else {
      el.setAttribute(key, val);
    }
  }
  children.forEach(child => {
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });
  return el;
}
