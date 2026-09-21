import * as guestStorage from '../storage/guestStorage.js';
import { importGuestData } from '../api/migrationApi.js';

export function getLocalDataSummary() {
  const data = guestStorage.getAllData();
  return {
    hasData: data.applications.length > 0,
    applicationCount: data.applications.length,
    requirementCount: data.requirements.length,
  };
}

export async function migrateToAccount() {
  const data = guestStorage.getAllData();
  const payload = {
    applications: data.applications.map(a => ({ localId: a.id, ...a })),
    requirements: data.requirements.map(r => ({ localId: r.id, localApplicationId: r.applicationId, ...r })),
    documents: data.documents.map(d => ({ localRequirementId: d.requirementId, ...d })),
  };
  const result = await importGuestData(payload);
  guestStorage.clearAll();
  return result;
}
