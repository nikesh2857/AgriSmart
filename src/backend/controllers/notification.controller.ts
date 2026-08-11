import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const listNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ notifications });
  } catch (err) { next(err); }
};

export const markRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body as { ids: string[] };
    await prisma.notification.updateMany({
      where: { id: { in: ids }, userId: req.user.id },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const markAllRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
};
