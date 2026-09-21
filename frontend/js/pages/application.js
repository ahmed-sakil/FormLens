import { initNavbar } from '../components/navbar.js';
import { getApplication, updateApplication, deleteApplication } from '../services/applicationService.js';
import { getRequirements, updateRequirement, createRequirement, deleteRequirement } from '../services/requirementService.js';
import { getDocument, saveDocument } from '../services/documentService.js';
import { isGuest } from '../services/modeService.js';
import { $, createElement } from '../utils/domUtils.js';
import { createRequirementItem } from '../components/requirementItem.js';
import { createDeadlineIndicator } from '../components/deadlineIndicator.js';
import { createProgressBar } from '../components/progressBar.js';
import { createStatusBadge } from '../components/statusBadge.js';
import { toast } from '../components/toast.js';
import { confirmDialog } from '../components/confirmDialog.js';
import { createModal, openModal, closeModal } from '../components/modal.js';
import { getExpiryStatus, formatDateShort } from '../utils/dateUtils.js';

let appId;
let app;
let reqs = [];
let docs = {};

async function loadData() {
  try {
    app = await getApplication(appId);
    if (!app) {
      toast.error('Application not found');
      window.location.href = 'applications.html';
      return;
    }
    reqs = await getRequirements(appId);
    docs = {};
    for (const r of reqs) {
      const doc = await getDocument(r.id);
      if (doc) docs[r.id] = doc;
    }
    renderAll();
  } catch (e) {
    console.error(e);
    toast.error('Failed to load application data');
  }
}

function getReadinessCalc() {
  const required = reqs.filter(r => r.required !== false);
  const completed = required.filter(r => r.completed);
  const missing = required.filter(r => !r.completed);
  const total = required.length;
  const percentage = total === 0 ? 0 : Math.round((completed.length / total) * 100);
  return { percentage, ready: total > 0 && completed.length === total, missing, total, completedCount: completed.length };
}

function renderAll() {
  $('#app-title').textContent = app.title;
  $('#app-category').textContent = app.category;
  
  const statusContainer = $('#app-status');
  statusContainer.innerHTML = '';
  statusContainer.appendChild(createStatusBadge(app.status));
  
  const { percentage, ready, missing, total, completedCount } = getReadinessCalc();
  
  const readinessPanel = $('#readiness-panel');
  readinessPanel.className = `readiness-panel ${ready ? 'readiness-ready' : 'readiness-not-ready'}`;
  readinessPanel.innerHTML = '';
  
  readinessPanel.appendChild(createElement('div', { className: 'readiness-header' },
    createElement('h3', {}, 'Application Readiness'),
    createElement('span', { className: 'readiness-display', style: ready ? 'color: var(--color-success); font-weight: 700;' : '' }, `${percentage}%`)
  ));

  readinessPanel.appendChild(createElement('p', { style: 'font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-2);' },
    total === 0 ? 'No requirements added yet (0% readiness).' : `${completedCount} of ${total} required item${total > 1 ? 's' : ''} completed`
  ));
  
  readinessPanel.appendChild(createProgressBar(percentage));
  
  if (!ready && missing.length > 0) {
    const ul = createElement('ul', { className: 'missing-items-list', style: 'margin-top: var(--space-3); font-size: var(--font-size-sm);' });
    missing.forEach(m => ul.appendChild(createElement('li', { style: 'color: var(--color-text-secondary);' }, `Missing: ${m.title}`)));
    readinessPanel.appendChild(ul);
  } else if (ready && total > 0) {
    readinessPanel.appendChild(createElement('p', { style: 'color: var(--color-success); font-weight: 600; margin-top: var(--space-3)' }, '✓ READY TO SUBMIT'));
  }
  
  const deadlinePanel = $('#deadline-panel');
  deadlinePanel.innerHTML = '';
  deadlinePanel.appendChild(createElement('h3', { style: 'margin-bottom: var(--space-2)' }, 'Deadline'));
  deadlinePanel.appendChild(createDeadlineIndicator(app.deadline));
  
  renderRequirements();
  renderDocuments();
}

function renderRequirements() {
  const container = $('#requirements-list');
  container.innerHTML = '';
  if (reqs.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: var(--space-6);">
        <p style="color: var(--color-text-muted); margin-bottom: var(--space-3);">No requirements added yet.</p>
        <button class="btn btn-primary btn-sm" onclick="document.getElementById('btn-add-req').click()">Add First Requirement</button>
      </div>
    `;
    return;
  }
  
  reqs.forEach(r => {
    container.appendChild(createRequirementItem(r, {
      docInfo: docs[r.id],
      onDocInfo: () => openDocModal(r.id, r.title, docs[r.id]),
      onToggle: async (checked) => {
        try {
          await updateRequirement(appId, r.id, { completed: checked });
          r.completed = checked;
          renderAll();
          const { percentage } = getReadinessCalc();
          toast.info(`Progress updated: ${percentage}% ready`);
        } catch (e) {
          toast.error('Failed to update requirement');
        }
      },
      onEdit: () => openReqModal(r),
      onDelete: async () => {
        if (await confirmDialog({ title: 'Delete Requirement', message: `Delete "${r.title}"?`, danger: true })) {
          await deleteRequirement(appId, r.id);
          reqs = reqs.filter(x => x.id !== r.id);
          delete docs[r.id];
          renderAll();
          toast.success('Requirement deleted');
        }
      }
    }));
  });
}

function renderDocuments() {
  const container = $('#documents-grid');
  container.innerHTML = '';
  
  const recordedDocs = reqs.filter(r => !!docs[r.id]);
  
  if (recordedDocs.length === 0) {
    container.innerHTML = `
      <div style="padding: var(--space-4); border: 1px dashed var(--color-border); border-radius: var(--radius); color: var(--color-text-muted); font-size: var(--font-size-sm); display: flex; justify-content: space-between; align-items: center; flex-wrap: gap: var(--space-2);">
        <span>No optional document metadata recorded yet. You can attach document dates/notes to any requirement.</span>
      </div>
    `;
    return;
  }

  recordedDocs.forEach(r => {
    const doc = docs[r.id];
    let expiryBadge = '';
    if (doc?.expiryDate) {
      const exp = getExpiryStatus(doc.expiryDate);
      const colors = {
        'Valid': 'var(--color-success)',
        'Expiring Soon': 'var(--color-warning)',
        'Expired': 'var(--color-danger)'
      };
      expiryBadge = `<span style="display: inline-block; font-size: var(--font-size-xs); padding: 2px 6px; border-radius: 4px; background: rgba(0,0,0,0.05); color: ${colors[exp.status] || 'inherit'}; font-weight: 600;">${exp.status}</span>`;
    }

    const card = createElement('div', { className: 'card', style: 'padding: var(--space-4); margin-bottom: var(--space-3);' },
      createElement('div', { style: 'display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-2);' },
        createElement('strong', {}, r.title),
        createElement('div', { html: expiryBadge })
      ),
      createElement('div', { style: 'font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-3);' },
        createElement('div', {}, `Document: ${doc.name || r.title}`),
        doc.documentType ? createElement('div', {}, `Type: ${doc.documentType}`) : '',
        doc.issueDate ? createElement('div', {}, `Issued: ${formatDateShort(doc.issueDate)}`) : '',
        doc.expiryDate ? createElement('div', {}, `Expires: ${formatDateShort(doc.expiryDate)}`) : '',
        doc.notes ? createElement('div', { style: 'font-style: italic; margin-top: 4px;' }, `Note: ${doc.notes}`) : ''
      ),
      createElement('div', { style: 'display: flex; gap: var(--space-2);' },
        createElement('button', {
          className: 'btn btn-ghost btn-xs',
          onclick: () => openDocModal(r.id, r.title, doc)
        }, 'Edit Details'),
        createElement('button', {
          className: 'btn btn-ghost btn-xs',
          style: 'color: var(--color-danger);',
          onclick: async () => {
            if (await confirmDialog({ title: 'Remove Document Info?', message: `Remove metadata for "${r.title}"?` })) {
              delete docs[r.id];
              renderAll();
              toast.success('Document info removed');
            }
          }
        }, 'Remove')
      )
    );
    container.appendChild(card);
  });
}

function openReqModal(req = null) {
  const id = 'req-modal';
  const old = $(`#${id}`); if (old) old.remove();
  const html = `
    <div class="form-group">
      <label class="form-label">Requirement Title</label>
      <input type="text" id="req-title" class="form-input" placeholder="e.g. Passport Copy, Statement of Purpose" value="${req?.title || ''}" required>
    </div>
    <div class="form-group">
      <label class="form-label">Notes / Instructions (optional)</label>
      <textarea id="req-desc" class="form-textarea" placeholder="e.g. Certified translation required">${req?.description || ''}</textarea>
    </div>
    <div class="checkbox-wrapper" style="margin-top: var(--space-3);">
      <input type="checkbox" id="req-required" class="checkbox-input" ${req ? (req.required ? 'checked' : '') : 'checked'}>
      <label class="checkbox-label" for="req-required">Required for readiness</label>
    </div>
  `;
  const footer = createElement('div', { style: 'display: flex; gap: 8px;' },
    createElement('button', { className: 'btn btn-secondary', onclick: () => closeModal(id) }, 'Cancel'),
    createElement('button', { className: 'btn btn-primary', onclick: async () => {
      const title = $('#req-title').value.trim();
      const description = $('#req-desc').value.trim();
      const required = $('#req-required').checked;
      if (!title) return toast.error('Title is required');
      try {
        if (req) {
          await updateRequirement(appId, req.id, { title, description, required });
          toast.success('Requirement updated');
        } else {
          await createRequirement(appId, { title, description, required });
          toast.success('Requirement added');
        }
        closeModal(id);
        await loadData();
      } catch (e) {
        toast.error('Failed to save requirement');
      }
    } }, 'Save Requirement')
  );
  document.body.appendChild(createModal({ id, title: req ? 'Edit Requirement' : 'Add Requirement', body: html, footer }));
  openModal(id);
}

function openDocModal(reqId, reqTitle, doc = null) {
  const id = 'doc-modal';
  const old = $(`#${id}`); if (old) old.remove();
  const html = `
    <div class="form-group">
      <label class="form-label">Document Name</label>
      <input type="text" id="doc-name" class="form-input" value="${doc?.name || reqTitle}" required>
    </div>
    <div class="form-group">
      <label class="form-label">Document Type (optional)</label>
      <input type="text" id="doc-type" class="form-input" placeholder="e.g. Passport, Certificate, Transcript" value="${doc?.documentType || ''}">
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
      <div class="form-group">
        <label class="form-label">Issue Date (optional)</label>
        <input type="date" id="doc-issue" class="form-input" value="${doc?.issueDate ? doc.issueDate.split('T')[0] : ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Expiry Date (optional)</label>
        <input type="date" id="doc-expiry" class="form-input" value="${doc?.expiryDate ? doc.expiryDate.split('T')[0] : ''}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Notes (optional)</label>
      <input type="text" id="doc-notes" class="form-input" placeholder="e.g. Valid until renewal" value="${doc?.notes || ''}">
    </div>
  `;
  const footer = createElement('div', { style: 'display: flex; gap: 8px;' },
    createElement('button', { className: 'btn btn-secondary', onclick: () => closeModal(id) }, 'Cancel'),
    createElement('button', { className: 'btn btn-primary', onclick: async () => {
      const name = $('#doc-name').value.trim() || reqTitle;
      const documentType = $('#doc-type').value.trim() || null;
      const issueDate = $('#doc-issue').value || null;
      const expiryDate = $('#doc-expiry').value || null;
      const notes = $('#doc-notes').value.trim() || null;
      
      try {
        await saveDocument(reqId, { name, documentType, issueDate, expiryDate, notes });
        toast.success('Document info saved');
        closeModal(id);
        await loadData();
      } catch (e) {
        toast.error('Failed to save document info');
      }
    } }, 'Save Document Info')
  );
  document.body.appendChild(createModal({ id, title: `Document Info: ${reqTitle}`, body: html, footer }));
  openModal(id);
}

document.addEventListener('DOMContentLoaded', async () => {
  await initNavbar();
  const params = new URLSearchParams(window.location.search);
  appId = params.get('id');
  if (!appId) {
    window.location.href = 'applications.html';
    return;
  }
  
  $('#btn-add-req').addEventListener('click', () => openReqModal());
  
  $('#btn-delete-app').addEventListener('click', async () => {
    if (await confirmDialog({
      title: 'Delete Application?',
      message: 'This will permanently remove this application and all associated requirements.',
      danger: true,
      confirmText: 'Delete Application'
    })) {
      await deleteApplication(appId);
      toast.success('Application deleted');
      window.location.href = 'applications.html';
    }
  });
  
  await loadData();
});
