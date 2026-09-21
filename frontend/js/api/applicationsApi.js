import { apiFetch } from './apiClient.js';
export async function getApplications(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/applications${query ? '?' + query : ''}`);
}
export async function createApplication(data) {
  return apiFetch('/applications', { method: 'POST', body: JSON.stringify(data) });
}
export async function getApplication(id) {
  return apiFetch(`/applications/${id}`);
}
export async function updateApplication(id, data) {
  return apiFetch(`/applications/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
export async function deleteApplication(id) {
  return apiFetch(`/applications/${id}`, { method: 'DELETE' });
}
export async function getReadiness(id) {
  return apiFetch(`/applications/${id}/readiness`);
}
