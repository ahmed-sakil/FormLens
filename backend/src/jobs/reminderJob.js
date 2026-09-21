import cron from 'node-cron';
import { prisma } from '../config/prisma.js';
import { emailService } from '../services/emailService.js';
import { logger } from '../utils/logger.js';
import { supabaseAdmin } from '../config/supabase.js';

export function startReminderJob() {
  cron.schedule('0 * * * *', async () => {
    logger.info('Reminder job: starting');
    try {
      const dueReminders = await prisma.reminder.findMany({
        where: { status: 'PENDING', remindAt: { lte: new Date() } },
        include: { application: { include: { profile: true } } },
        take: 100,
      });

      logger.info(`Reminder job: found ${dueReminders.length} due reminders`);

      for (const reminder of dueReminders) {
        const claimed = await prisma.reminder.updateMany({
          where: { id: reminder.id, status: 'PENDING' },
          data: { status: 'PROCESSING' },
        });
        if (claimed.count === 0) continue;

        if (reminder.application.archived || reminder.application.status === 'ARCHIVED') {
          await prisma.reminder.update({ where: { id: reminder.id }, data: { status: 'SENT', sentAt: new Date(), failureReason: 'Application archived' } });
          continue;
        }

        const daysMap = { DAYS_1: 1, DAYS_3: 3, DAYS_7: 7, DAYS_14: 14, DAYS_30: 30 };
        try {
          const authUser = await supabaseAdmin.auth.admin.getUserById(reminder.application.profile.authUserId);
          if (authUser.error) throw new Error(`Failed to fetch user: ${authUser.error.message}`);
          const email = authUser.data.user.email;

          await emailService.sendDeadlineReminder({
            to: email,
            userName: reminder.application.profile.name,
            applicationTitle: reminder.application.title,
            deadline: reminder.application.deadline,
            daysRemaining: daysMap[reminder.type],
          });
          await prisma.reminder.update({ where: { id: reminder.id }, data: { status: 'SENT', sentAt: new Date() } });
          logger.info(`Reminder sent: ${reminder.id}`);
        } catch (err) {
          await prisma.reminder.update({ where: { id: reminder.id }, data: { status: 'FAILED', failureReason: err.message } });
          logger.error(`Reminder failed: ${reminder.id}`, { error: err.message });
        }
      }
    } catch (err) {
      logger.error('Reminder job error:', { error: err.message });
    }
  });
}
