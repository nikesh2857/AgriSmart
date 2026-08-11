import { z } from 'zod';

export const createJobSchema = z.object({
  workName: z.string().min(3, 'Work name must be at least 3 characters'),
  workAddress: z.string().min(5, 'Address must be at least 5 characters'),
  dateTime: z.string().datetime('Invalid date/time format (must be ISO 8601)'),
  workersNeeded: z.number().int().min(1, 'At least 1 worker required'),
  payPerWorker: z.number().positive().optional(),
  description: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  polygonGeoJson: z.any().optional(),
});

export const jobQuerySchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});
