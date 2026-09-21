const STORAGE_KEY = 'formlens_guest_data';
const DEFAULT_STATE = { applications: [], requirements: [], documents: [], version: 1 };

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.applications)) return { ...DEFAULT_STATE };
    return parsed;
  } catch { return { ...DEFAULT_STATE }; }
}

function save(state) { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

export function getApplications() { return load().applications; }
export function saveApplication(app) {
  const state = load();
  const idx = state.applications.findIndex(a => a.id === app.id);
  if (idx >= 0) state.applications[idx] = { ...state.applications[idx], ...app, updatedAt: new Date().toISOString() };
  else state.applications.push({ ...app, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  save(state);
  return app;
}
export function deleteApplication(id) {
  const state = load();
  state.applications = state.applications.filter(a => a.id !== id);
  state.requirements = state.requirements.filter(r => r.applicationId !== id);
  const reqIds = state.requirements.map(r => r.id);
  state.documents = state.documents.filter(d => reqIds.includes(d.requirementId));
  save(state);
}

export function getRequirements(applicationId) { return load().requirements.filter(r => r.applicationId === applicationId); }
export function saveRequirement(req) {
  const state = load();
  const idx = state.requirements.findIndex(r => r.id === req.id);
  if (idx >= 0) state.requirements[idx] = { ...state.requirements[idx], ...req, updatedAt: new Date().toISOString() };
  else state.requirements.push({ ...req, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  save(state);
  return req;
}
export function deleteRequirement(id) {
  const state = load();
  state.requirements = state.requirements.filter(r => r.id !== id);
  state.documents = state.documents.filter(d => d.requirementId !== id);
  save(state);
}

export function getDocument(requirementId) { return load().documents.find(d => d.requirementId === requirementId) || null; }
export function saveDocument(doc) {
  const state = load();
  const idx = state.documents.findIndex(d => d.requirementId === doc.requirementId);
  if (idx >= 0) state.documents[idx] = { ...state.documents[idx], ...doc, updatedAt: new Date().toISOString() };
  else state.documents.push({ ...doc, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  save(state);
  return doc;
}
export function deleteDocument(requirementId) {
  const state = load();
  state.documents = state.documents.filter(d => d.requirementId !== requirementId);
  save(state);
}

export function getAllData() { return load(); }
export function clearAll() { localStorage.removeItem(STORAGE_KEY); }
export function hasData() { return load().applications.length > 0; }
