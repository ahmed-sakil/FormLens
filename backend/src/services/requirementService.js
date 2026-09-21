import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { getApplication } from './applicationService.js';

export async function listRequirements(profileId, applicationId) {
  await getApplication(profileId, applicationId);
  return await prisma.requirement.findMany({ where: { applicationId }, include: { document: true } });
}

export async function createRequirement(profileId, applicationId, data) {
  await getApplication(profileId, applicationId);
  return await prisma.requirement.create({
    data: { ...data, applicationId }
  });
}

async function getRequirement(profileId, requirementId) {
  const req = await prisma.requirement.findUnique({
    where: { id: requirementId },
    include: { application: true, document: true }
  });
  if (!req || req.application.profileId !== profileId) throw new AppError('NOT_FOUND', 'Requirement not found', 404);
  return req;
}

export async function updateRequirement(profileId, requirementId, data) {
  await getRequirement(profileId, requirementId);
  return await prisma.requirement.update({ where: { id: requirementId }, data });
}

export async function deleteRequirement(profileId, requirementId) {
  await getRequirement(profileId, requirementId);
  return await prisma.requirement.delete({ where: { id: requirementId } });
}

export { getRequirement };
