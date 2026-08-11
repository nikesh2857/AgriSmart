import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import * as jobController from '../controllers/job.controller';

const router = Router();

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: List jobs (role-aware)
 *     security: [{bearerAuth: []}]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: List of jobs }
 */
router.get('/', requireAuth, jobController.listJobs);

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a job (Farmer only)
 *     security: [{bearerAuth: []}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workName, workAddress, dateTime, workersNeeded]
 *             properties:
 *               workName: { type: string }
 *               workAddress: { type: string }
 *               dateTime: { type: string, format: date-time }
 *               workersNeeded: { type: integer }
 *               payPerWorker: { type: number }
 *               description: { type: string }
 *     responses:
 *       201: { description: Job created }
 *       403: { description: Forbidden }
 */
router.post('/', requireAuth, requireRole(['FARMER', 'ADMIN']), jobController.createJob);

/**
 * @swagger
 * /api/jobs/{id}/accept:
 *   patch:
 *     summary: Accept a job (Worker only)
 *     security: [{bearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Assignment created }
 *       400: { description: Conflict or capacity error }
 */
router.patch('/:id/accept', requireAuth, requireRole(['WORKER']), jobController.acceptJob);

/**
 * @swagger
 * /api/jobs/{id}/complete:
 *   patch:
 *     summary: Mark job as complete (Farmer only)
 *     security: [{bearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Job completed }
 */
router.patch('/:id/complete', requireAuth, requireRole(['FARMER', 'ADMIN']), jobController.completeJob);

/**
 * @swagger
 * /api/jobs/{id}/cancel:
 *   patch:
 *     summary: Cancel a job
 *     security: [{bearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Job cancelled }
 */
router.patch('/:id/cancel', requireAuth, requireRole(['FARMER', 'ADMIN']), jobController.cancelJob);

/**
 * @swagger
 * /api/jobs/{id}/reject:
 *   post:
 *     summary: Reject a job (Worker only)
 *     security: [{bearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Job rejected }
 */
router.post('/:id/reject', requireAuth, requireRole(['WORKER']), jobController.rejectJob);

/**
 * @swagger
 * /api/jobs/{id}/checkin:
 *   post:
 *     summary: Worker check-in
 *     security: [{bearerAuth: []}]
 *     responses:
 *       200: { description: Checked in }
 */
router.post('/:id/checkin', requireAuth, requireRole(['WORKER']), jobController.checkIn);

/**
 * @swagger
 * /api/jobs/{id}/checkout:
 *   post:
 *     summary: Worker check-out
 *     security: [{bearerAuth: []}]
 *     responses:
 *       200: { description: Checked out }
 */
router.post('/:id/checkout', requireAuth, requireRole(['WORKER']), jobController.checkOut);

export default router;
