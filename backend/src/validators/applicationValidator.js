import { z } from 'zod';

const flexibleDate = z.string().refine(val => !isNaN(Date.parse(val)), {
  message: 'Invalid date format'
}).transform(val => new Date(val)).optional().nullable();

export const createApplicationSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).optional(),
  category: z.enum(['UNIVERSITY','SCHOLARSHIP','JOB','INTERNSHIP','VISA','GOVERNMENT','CERTIFICATION','OTHER']),
  deadline: flexibleDate,
});

export const updateApplicationSchema = createApplicationSchema.partial();
