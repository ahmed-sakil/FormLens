import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { REMINDER_DAYS } from '../config/constants.js';
import { getApplication } from './applicationService.js';

export async function listReminders(profileId, applicationId) {
  await getApplication(profileId, applicationId);
  return await prisma.reminder.findMany({ where: { applicationId } });
}

export async function upsertReminder(profileId, applicationId, type) {
  const app = await getApplication(profileId, applicationId);
  if (!app.deadline) throw new AppError('BAD_REQUEST', 'Application has no deadline', 400);

  const d = new Date(app.deadline);
  d.setDate(d.getDate() - REMINDER_DAYS[type]);

  return await prisma.reminder.upsert({
    where: { applicationId_type: { applicationId, type } },
    update: { remindAt: d, status: 'PENDING' },
    create: { applicationId, type, remindAt: d }
  });
}

export async function deleteReminder(profileId, reminderId) {
  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
    include: { application: true }
  });
  if (!reminder || reminder.application.profileId !== profileId) throw new AppError('NOT_FOUND', 'Reminder not found', 404);
  return await prisma.reminder.delete({ where: { id: reminderId } });
}

export async function syncRemindersForDeadline(applicationId, newDeadline) {
  if (!newDeadline) return;
  const reminders = await prisma.reminder.findMany({ where: { applicationId, status: 'PENDING' } });
  
  for (const rem of reminders) {
    const d = new Date(newDeadline);
    d.setDate(d.getDate() - REMINDER_DAYS[rem.type]);
    if (d < new Date()) {
      await prisma.reminder.delete({ where: { id: rem.id } });
    } else {
      await prisma.reminder.update({ where: { id: rem.id }, data: { remindAt: d } });
    }
  }
}
