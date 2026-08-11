import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get current user's notifications (last 50)
 *     security: [{bearerAuth: []}]
 *     responses:
 *       200: { description: List of notifications }
 */
router.get('/', requireAuth, notificationController.listNotifications);

/**
 * @swagger
 * /api/notifications/read:
 *   patch:
 *     summary: Mark specific notifications as read
 *     security: [{bearerAuth: []}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids: { type: array, items: { type: string } }
 *     responses:
 *       200: { description: Success }
 */
router.patch('/read', requireAuth, notificationController.markRead);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     security: [{bearerAuth: []}]
 *     responses:
 *       200: { description: Success }
 */
router.patch('/read-all', requireAuth, notificationController.markAllRead);

export default router;
