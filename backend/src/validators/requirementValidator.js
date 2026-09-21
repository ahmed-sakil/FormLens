import { z } from 'zod';

export const createRequirementSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).optional(),
  required: z.boolean().optional().default(true),
  completed: z.boolean().optional().default(false),
});

export const updateRequirementSchema = createRequirementSchema.partial();
