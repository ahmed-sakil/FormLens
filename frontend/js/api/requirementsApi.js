import { apiFetch } from './apiClient.js';
export async function getRequirements(applicationId) { return apiFetch(`/applications/${applicationId}/requirements`); }
export async function createRequirement(applicationId, data) { return apiFetch(`/applications/${applicationId}/requirements`, { method: 'POST', body: JSON.stringify(data) }); }
export async function updateRequirement(applicationId, id, data) { return apiFetch(`/requirements/${id}`, { method: 'PATCH', body: JSON.stringify(data) }); }
export async function deleteRequirement(applicationId, id) { return apiFetch(`/requirements/${id}`, { method: 'DELETE' }); }
