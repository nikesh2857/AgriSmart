import { Request, Response, NextFunction } from 'express';
import { analyticsQuerySchema, updateUserRoleSchema } from '../validators/admin.validator';
import * as adminService from '../services/admin.service';

export const getPlatformStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getPlatformStats();
    res.json(stats);
  } catch (err) { next(err); }
};

export const getRevenueTimeline = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to } = analyticsQuerySchema.parse(req.query);
    const timeline = await adminService.getRevenueTimeline(
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined
    );
    res.json({ timeline });
  } catch (err) { next(err); }
};

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await adminService.listAllUsers(page, limit);
    res.json(result);
  } catch (err) { next(err); }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = updateUserRoleSchema.parse(req.body);
    const user = await adminService.updateUserRole(req.params.id, role);
    res.json({ user });
  } catch (err) { next(err); }
};

export const getRecentActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const activity = await adminService.getRecentActivity(limit);
    res.json({ activity });
  } catch (err) { next(err); }
};

export const hardDeleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await adminService.hardDeleteProduct(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
};
