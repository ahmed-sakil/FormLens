import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});
