import { isGuest } from './modeService.js';
import * as api from '../api/remindersApi.js';

export async function getReminders(applicationId) {
  if (isGuest()) return [];
  return api.getReminders(applicationId);
}

export async function toggleReminder(applicationId, type, enabled) {
  if (isGuest()) return null;
  return api.toggleReminder(applicationId, type, enabled);
}

export async function deleteReminder(reminderId) {
  if (isGuest()) return null;
  return api.deleteReminder(reminderId);
}
