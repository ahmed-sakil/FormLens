import { apiFetch } from './apiClient.js';

export async function getReminders(applicationId) {
  return apiFetch(`/applications/${applicationId}/reminders`);
}

export async function toggleReminder(applicationId, type, enabled) {
  return apiFetch(`/applications/${applicationId}/reminders`, {
    method: 'POST',
    body: JSON.stringify({ type, enabled })
  });
}

export async function deleteReminder(reminderId) {
  return apiFetch(`/reminders/${reminderId}`, {
    method: 'DELETE'
  });
}
