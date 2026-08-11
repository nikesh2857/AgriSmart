import { Request, Response, NextFunction } from 'express';
import { createJobSchema, jobQuerySchema } from '../validators/job.validator';
import * as jobService from '../services/job.service';

export const listJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, page, limit } = jobQuerySchema.parse(req.query);
    const result = await jobService.listJobs(req.user.id, req.user.role, status, page, limit);
    res.json(result);
  } catch (err) { next(err); }
};

export const createJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createJobSchema.parse(req.body);
    const job = await jobService.createJob(req.user.id, data);
    res.status(201).json({ job });
  } catch (err) { next(err); }
};

export const acceptJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await jobService.acceptJob(req.params.id, req.user.id);
    res.json({ assignment });
  } catch (err) { next(err); }
};

export const completeJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await jobService.completeJob(req.params.id, req.user.id, req.user.role);
    res.json({ job });
  } catch (err) { next(err); }
};

export const cancelJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await jobService.cancelJob(req.params.id, req.user.id, req.user.role);
    res.json({ job });
  } catch (err) { next(err); }
};

export const rejectJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await jobService.rejectJob(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const checkIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng } = req.body;
    const assignment = await jobService.checkIn(req.params.id, req.user.id, lat, lng);
    res.json({ assignment });
  } catch (err) { next(err); }
};

export const checkOut = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await jobService.checkOut(req.params.id, req.user.id);
    res.json({ assignment });
  } catch (err) { next(err); }
};
