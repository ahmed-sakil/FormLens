import { z } from 'zod';

const flexibleDate = z.string().refine(val => !isNaN(Date.parse(val)), {
  message: 'Invalid date format'
}).transform(val => new Date(val)).optional().nullable();

export const migrationSchema = z.object({
  applications: z.array(z.object({
    localId: z.string(),
    title: z.string().min(1).max(200).trim(),
    description: z.string().max(2000).optional().nullable(),
    category: z.enum(['UNIVERSITY','SCHOLARSHIP','JOB','INTERNSHIP','VISA','GOVERNMENT','CERTIFICATION','OTHER']),
    deadline: flexibleDate,
    status: z.enum(['ACTIVE','COMPLETED','ARCHIVED']).optional().default('ACTIVE'),
    archived: z.boolean().optional().default(false),
  })).max(500),
  requirements: z.array(z.object({
    localId: z.string(),
    localApplicationId: z.string(),
    title: z.string().min(1).max(200).trim(),
    description: z.string().max(2000).optional().nullable(),
    required: z.boolean().optional().default(true),
    completed: z.boolean().optional().default(false),
  })).max(5000),
  documents: z.array(z.object({
    localRequirementId: z.string(),
    name: z.string().min(1).max(200).trim().optional().default('Document'),
    documentType: z.string().max(100).optional().nullable(),
    issueDate: flexibleDate,
    expiryDate: flexibleDate,
    notes: z.string().max(1000).optional().nullable(),
  })).max(5000),
});
