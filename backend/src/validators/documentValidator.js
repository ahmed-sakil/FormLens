import { z } from 'zod';

const flexibleDate = z.string().refine(val => !isNaN(Date.parse(val)), {
  message: 'Invalid date format'
}).transform(val => new Date(val)).optional().nullable();

export const upsertDocumentSchema = z.object({
  name: z.string().min(1).max(200).trim().optional().default('Document'),
  documentType: z.string().max(100).optional().nullable(),
  issueDate: flexibleDate,
  expiryDate: flexibleDate,
  notes: z.string().max(1000).optional().nullable(),
});
