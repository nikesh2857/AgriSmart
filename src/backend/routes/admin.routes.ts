import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import * as adminController from '../controllers/admin.controller';

const router = Router();

// All admin routes require auth + ADMIN role
router.use(requireAuth, requireRole(['ADMIN']));

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Platform overview — users, jobs, revenue, equipment
 *     security: [{bearerAuth: []}]
 *     responses:
 *       200:
 *         description: Aggregated platform statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users: { type: object }
 *                 jobs: { type: object }
 *                 marketplace: { type: object }
 *                 equipment: { type: object }
 */
router.get('/stats', adminController.getPlatformStats);

/**
 * @swagger
 * /api/admin/revenue:
 *   get:
 *     summary: Revenue timeline (daily totals)
 *     security: [{bearerAuth: []}]
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Array of { date, revenue } objects
 */
router.get('/revenue', adminController.getRevenueTimeline);

/**
 * @swagger
 * /api/admin/activity:
 *   get:
 *     summary: Recent platform activity feed (jobs, orders, rentals)
 *     security: [{bearerAuth: []}]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Mixed activity feed sorted by recency
 */
router.get('/activity', adminController.getRecentActivity);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all platform users (paginated)
 *     security: [{bearerAuth: []}]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated user list
 */
router.get('/users', adminController.listUsers);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: Update a user's role
 *     security: [{bearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role: { type: string, enum: [FARMER, BUYER, WORKER, ADMIN] }
 *     responses:
 *       200:
 *         description: Updated user object
 */
router.patch('/users/:id/role', adminController.updateUserRole);

/**
 * @swagger
 * /api/admin/products/{id}:
 *   delete:
 *     summary: Hard-delete a product (Admin-only permanent removal)
 *     security: [{bearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product permanently deleted
 */
router.delete('/products/:id', adminController.hardDeleteProduct);

export default router;
