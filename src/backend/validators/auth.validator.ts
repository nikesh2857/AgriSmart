import { z } from 'zod';

export const syncUserSchema = z.object({
  role: z.enum(['FARMER', 'BUYER', 'WORKER', 'ADMIN']).optional(),
});
