import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as rentalController from '../controllers/rental.controller';

const router = Router();

/**
 * @swagger
 * /api/equipment:
 *   get:
 *     summary: List all available equipment
 *     responses:
 *       200: { description: Paginated equipment list }
 */
router.get('/', rentalController.listEquipment);

/**
 * @swagger
 * /api/equipment/{id}/availability:
 *   get:
 *     summary: Get availability calendar for a piece of equipment
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Availability info with blocked periods }
 */
router.get('/:id/availability', rentalController.getAvailability);

/**
 * @swagger
 * /api/equipment/rentals:
 *   post:
 *     summary: Book a piece of equipment
 *     security: [{bearerAuth: []}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [equipmentId, startDate, endDate]
 *             properties:
 *               equipmentId: { type: string }
 *               startDate: { type: string, format: date }
 *               endDate: { type: string, format: date }
 *     responses:
 *       201: { description: Rental created }
 *       400: { description: Dates unavailable }
 */
router.post('/rentals', requireAuth, rentalController.createRental);

/**
 * @swagger
 * /api/equipment/rentals:
 *   get:
 *     summary: List rentals for current user (or all for Admin)
 *     security: [{bearerAuth: []}]
 */
router.get('/rentals', requireAuth, rentalController.listRentals);

/**
 * @swagger
 * /api/equipment/rentals/{id}/cancel:
 *   patch:
 *     summary: Cancel a rental
 *     security: [{bearerAuth: []}]
 */
router.patch('/rentals/:id/cancel', requireAuth, rentalController.cancelRental);

export default router;
