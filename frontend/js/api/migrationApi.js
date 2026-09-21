import { apiFetch } from './apiClient.js';
export async function importGuestData(data) { return apiFetch('/migration/import', { method: 'POST', body: JSON.stringify(data) }); }
