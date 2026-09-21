import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { getRequirement } from './requirementService.js';
import { EXPIRING_SOON_DAYS } from '../config/constants.js';

export function calculateExpiryStatus(expiryDate) {
  if (!expiryDate) return { status: 'No expiry', daysRemaining: null };
  const now = new Date();
  const d = new Date(expiryDate);
  const diffTime = d - now;
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) return { status: 'Expired', daysRemaining };
  if (daysRemaining <= EXPIRING_SOON_DAYS) return { status: 'Expiring Soon', daysRemaining };
  return { status: 'Valid', daysRemaining };
}

export async function getDocument(profileId, requirementId) {
  const req = await getRequirement(profileId, requirementId);
  if (!req.document) throw new AppError('NOT_FOUND', 'Document not found', 404);
  const doc = req.document;
  return { ...doc, expiryStatus: calculateExpiryStatus(doc.expiryDate) };
}

export async function upsertDocument(profileId, requirementId, data) {
  await getRequirement(profileId, requirementId);
  return await prisma.document.upsert({
    where: { requirementId },
    update: data,
    create: { ...data, requirementId }
  });
}

export async function deleteDocument(profileId, requirementId) {
  const doc = await getDocument(profileId, requirementId);
  return await prisma.document.delete({ where: { id: doc.id } });
}
