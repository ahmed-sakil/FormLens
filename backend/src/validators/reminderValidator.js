import { z } from 'zod';

const validTypes = ['DAYS_1','DAYS_3','DAYS_7','DAYS_14','DAYS_30'];
export const createReminderSchema = z.object({
  type: z.enum(validTypes),
  enabled: z.boolean().optional().default(true),
});

export const updateReminderSchema = z.object({
  enabled: z.boolean(),
});
