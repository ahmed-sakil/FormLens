import { apiFetch } from './apiClient.js';
export async function getDocument(requirementId) { return apiFetch(`/requirements/${requirementId}/document`); }
export async function saveDocument(requirementId, data) { return apiFetch(`/requirements/${requirementId}/document`, { method: 'PUT', body: JSON.stringify(data) }); }
export async function deleteDocument(requirementId) { return apiFetch(`/requirements/${requirementId}/document`, { method: 'DELETE' }); }
