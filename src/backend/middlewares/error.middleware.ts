import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('[ErrorHandler]', err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.issues,
    });
  }

  // Known business logic errors (thrown as plain Error with a message)
  const statusMap: Record<string, number> = {
    'not found': 404,
    'forbidden': 403,
    'unauthorized': 401,
    'insufficient stock': 400,
    'already completed': 400,
    'cannot cancel': 400,
    'not available': 400,
    'conflict': 409,
    'already has a job': 409,
    'fully staffed': 409,
  };

  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    for (const [keyword, status] of Object.entries(statusMap)) {
      if (msg.includes(keyword)) {
        return res.status(status).json({ error: err.message });
      }
    }
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal Server Error' });
};
