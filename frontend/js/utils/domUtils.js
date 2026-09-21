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
    } else if (key === 'dataset' && typeof val === 'object' && val !== null) {
      for (const [dKey, dVal] of Object.entries(val)) el.dataset[dKey] = dVal;
    } else if (key === 'html') {
      el.innerHTML = val;
    } else if (key === 'checked') {
      el.checked = Boolean(val);
      if (val) el.setAttribute('checked', '');
      else el.removeAttribute('checked');
    } else if (key === 'disabled') {
      el.disabled = Boolean(val);
      if (val) el.setAttribute('disabled', '');
      else el.removeAttribute('disabled');
    } else if (key === 'selected') {
      el.selected = Boolean(val);
      if (val) el.setAttribute('selected', '');
      else el.removeAttribute('selected');
    } else if (key === 'value') {
      el.value = val ?? '';
    } else if (typeof val === 'boolean') {
      if (val) el.setAttribute(key, '');
      else el.removeAttribute(key);
    } else if (val !== null && val !== undefined) {
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
