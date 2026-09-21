import { isGuest } from './modeService.js';
import * as guestStorage from '../storage/guestStorage.js';
import * as api from '../api/documentsApi.js';

export async function getDocument(requirementId) {
  if (isGuest()) return guestStorage.getDocument(requirementId);
  return api.getDocument(requirementId).catch(err => {
    if (err.status === 404 || err.code === 'NOT_FOUND') return null;
    throw err;
  });
}
export async function saveDocument(requirementId, data) {
  if (isGuest()) return guestStorage.saveDocument({ requirementId, ...data });
  return api.saveDocument(requirementId, data);
}
export async function deleteDocument(requirementId) {
  if (isGuest()) return guestStorage.deleteDocument(requirementId);
  return api.deleteDocument(requirementId);
}
