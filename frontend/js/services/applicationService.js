import { isGuest } from './modeService.js';
import * as guestStorage from '../storage/guestStorage.js';
import * as api from '../api/applicationsApi.js';
import { generateId } from '../utils/idUtils.js';

export async function getApplications(params = {}) {
  if (isGuest()) {
    let apps = guestStorage.getApplications();
    if (params.search) apps = apps.filter(a => a.title.toLowerCase().includes(params.search.toLowerCase()));
    if (params.category) apps = apps.filter(a => a.category === params.category);
    if (params.status) apps = apps.filter(a => a.status === params.status);
    return apps;
  }
  return api.getApplications(params);
}
export async function getApplication(id) {
  if (isGuest()) {
    const app = guestStorage.getApplications().find(a => a.id === id);
    if (!app) throw new Error('Not found');
    return app;
  }
  return api.getApplication(id);
}
export async function createApplication(data) {
  if (isGuest()) {
    const app = { id: generateId(), ...data, status: 'ACTIVE', archived: false };
    return guestStorage.saveApplication(app);
  }
  return api.createApplication(data);
}
export async function updateApplication(id, data) {
  if (isGuest()) {
    const app = guestStorage.getApplications().find(a => a.id === id);
    return guestStorage.saveApplication({ ...app, ...data });
  }
  return api.updateApplication(id, data);
}
export async function deleteApplication(id) {
  if (isGuest()) return guestStorage.deleteApplication(id);
  return api.deleteApplication(id);
}
export async function getReadiness(applicationId) {
  if (isGuest()) {
    const { calculateReadiness } = await import('./readinessService.js');
    const app = guestStorage.getApplications().find(a => a.id === applicationId);
    const reqs = guestStorage.getRequirements(applicationId);
    return calculateReadiness(app, reqs);
  }
  return api.getReadiness(applicationId);
}
