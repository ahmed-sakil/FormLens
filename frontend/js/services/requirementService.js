import { isGuest } from './modeService.js';
import * as guestStorage from '../storage/guestStorage.js';
import * as api from '../api/requirementsApi.js';
import { generateId } from '../utils/idUtils.js';

export async function getRequirements(applicationId) {
  if (isGuest()) return guestStorage.getRequirements(applicationId);
  return api.getRequirements(applicationId);
}
export async function createRequirement(applicationId, data) {
  if (isGuest()) {
    const req = { id: generateId(), applicationId, completed: false, required: true, ...data };
    return guestStorage.saveRequirement(req);
  }
  return api.createRequirement(applicationId, data);
}
export async function updateRequirement(applicationId, id, data) {
  if (isGuest()) {
    const req = guestStorage.getRequirements(applicationId).find(r => r.id === id);
    return guestStorage.saveRequirement({ ...req, ...data });
  }
  return api.updateRequirement(applicationId, id, data);
}
export async function deleteRequirement(applicationId, id) {
  if (isGuest()) return guestStorage.deleteRequirement(id);
  return api.deleteRequirement(applicationId, id);
}
