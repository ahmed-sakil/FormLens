import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).trim(),
});

export const changePasswordSchema = z.object({
  newPassword: z.string().min(8).max(128),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});
