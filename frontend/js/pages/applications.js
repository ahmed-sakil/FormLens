import { initNavbar } from '../components/navbar.js';
import { getApplications, createApplication, getReadiness } from '../services/applicationService.js';
import { $, $$, createElement } from '../utils/domUtils.js';
import { createApplicationCard } from '../components/applicationCard.js';
import { createModal, openModal, closeModal } from '../components/modal.js';
import { validateApplicationForm } from '../validation/applicationSchema.js';
import { debounce } from '../utils/debounce.js';
import { toast } from '../components/toast.js';

let apps = [];
let readinessMap = {};

async function loadApps() {
  const container = $('#applications-grid');
  container.innerHTML = 'Loading...';
  try {
    apps = await getApplications();
    for (const app of apps) {
      readinessMap[app.id] = await getReadiness(app.id);
    }
    renderApps();
  } catch (e) {
    container.innerHTML = 'Error loading applications.';
  }
}

function renderApps() {
  const container = $('#applications-grid');
  container.innerHTML = '';
  
  const search = $('#search').value.toLowerCase();
  const cat = $('#filter-category').value;
  const stat = $('#filter-status').value;
  const sort = $('#sort').value;
  
  let filtered = apps.filter(a => {
    if (search && !a.title.toLowerCase().includes(search)) return false;
    if (cat && a.category !== cat) return false;
    if (stat && a.status !== stat) return false;
    return true;
  });
  
  filtered.sort((a, b) => {
    if (sort === 'deadline') {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    }
    if (sort === 'title') return a.title.localeCompare(b.title);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state">No applications found.</div>';
    return;
  }
  
  filtered.forEach(app => {
    container.appendChild(createApplicationCard(app, readinessMap[app.id]));
  });
}

function setupCreateModal() {
  const formHtml = `
    <form id="create-app-form">
      <div class="form-group"><label class="form-label">Title</label><input type="text" id="app-title" class="form-input"></div>
      <div class="form-group"><label class="form-label">Category</label><select id="app-category" class="form-select">
        <option value="UNIVERSITY">University</option>
        <option value="SCHOLARSHIP">Scholarship</option>
        <option value="JOB">Job</option>
        <option value="INTERNSHIP">Internship</option>
        <option value="VISA">Visa</option>
        <option value="GOVERNMENT">Government</option>
        <option value="CERTIFICATION">Certification</option>
        <option value="OTHER">Other</option>
      </select></div>
      <div class="form-group"><label class="form-label">Description (optional)</label><textarea id="app-desc" class="form-textarea"></textarea></div>
      <div class="form-group"><label class="form-label">Deadline (optional)</label><input type="date" id="app-deadline" class="form-input"></div>
    </form>
  `;
  const footer = createElement('div', { style: 'display: flex; gap: var(--space-2)' },
    createElement('button', { className: 'btn btn-secondary', onclick: () => closeModal('create-modal') }, 'Cancel'),
    createElement('button', { className: 'btn btn-primary', onclick: async () => {
      const title = $('#app-title').value;
      const category = $('#app-category').value;
      const description = $('#app-desc').value;
      const deadline = $('#app-deadline').value || null;
      const errs = validateApplicationForm({ title, category });
      if (Object.keys(errs).length > 0) return toast.error('Please fix validation errors');
      try {
        const created = await createApplication({ title, category, description, deadline });
        toast.success('Application created!');
        closeModal('create-modal');
        if (created?.id) {
          window.location.href = `application.html?id=${created.id}`;
        } else {
          loadApps();
        }
      } catch (e) { toast.error('Failed to create application'); }
    }}, 'Create')
  );
  document.body.appendChild(createModal({ id: 'create-modal', title: 'New Application', body: formHtml, footer }));
}

document.addEventListener('DOMContentLoaded', async () => {
  await initNavbar();
  setupCreateModal();
  
  $('#new-app-btn').addEventListener('click', () => openModal('create-modal'));
  $('#search').addEventListener('input', debounce(renderApps, 300));
  $('#filter-category').addEventListener('change', renderApps);
  $('#filter-status').addEventListener('change', renderApps);
  $('#sort').addEventListener('change', renderApps);
  
  loadApps();
});
