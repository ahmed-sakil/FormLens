import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { syncRemindersForDeadline } from './reminderService.js';

export async function listApplications(profileId, { search, category, status, archived, sortBy }) {
  const where = { profileId };
  if (search) where.title = { contains: search, mode: 'insensitive' };
  if (category) where.category = category;
  if (status) where.status = status;
  if (archived !== undefined) where.archived = archived === 'true';

  const orderBy = {};
  if (sortBy === 'deadline') orderBy.deadline = 'asc';
  else if (sortBy === 'createdAt') orderBy.createdAt = 'desc';

  return await prisma.application.findMany({ where, orderBy });
}

export async function createApplication(profileId, data) {
  return await prisma.application.create({
    data: { ...data, profileId }
  });
}

export async function getApplication(profileId, applicationId) {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { requirements: true, reminders: true }
  });
  if (!app || app.profileId !== profileId) throw new AppError('NOT_FOUND', 'Application not found', 404);
  return app;
}

export async function updateApplication(profileId, applicationId, data) {
  const app = await getApplication(profileId, applicationId);
  const updated = await prisma.application.update({
    where: { id: applicationId },
    data
  });

  if (data.deadline && data.deadline !== app.deadline) {
    await syncRemindersForDeadline(applicationId, data.deadline);
  }

  return updated;
}

export async function deleteApplication(profileId, applicationId) {
  await getApplication(profileId, applicationId);
  return await prisma.application.delete({ where: { id: applicationId } });
}

export async function calculateReadiness(profileId, applicationId) {
  const app = await getApplication(profileId, applicationId);
  const reqs = app.requirements.filter(r => r.required);
  const total = reqs.length;
  const completed = reqs.filter(r => r.completed).length;
  const percentage = total === 0 ? 100 : Math.round((completed / total) * 100);
  const ready = percentage === 100;
  const missing = reqs.filter(r => !r.completed).map(r => ({ id: r.id, title: r.title }));

  return { total, completed, percentage, ready, missing };
}
