import { apiFetch } from './apiClient.js';
export async function getProfile() { return apiFetch('/profile'); }
export async function updateProfile(data) { return apiFetch('/profile', { method: 'PATCH', body: JSON.stringify(data) }); }
