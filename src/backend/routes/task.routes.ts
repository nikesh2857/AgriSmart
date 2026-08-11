import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as taskController from '../controllers/task.controller';

const router = Router();

// All task routes require authentication
router.use(requireAuth);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: List all tasks for the authenticated user
 *     security: [{bearerAuth: []}]
 */
router.get('/', taskController.listTasks);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     security: [{bearerAuth: []}]
 */
router.post('/', taskController.createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   patch:
 *     summary: Update task status or details
 *     security: [{bearerAuth: []}]
 */
router.patch('/:id', taskController.updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     security: [{bearerAuth: []}]
 */
router.delete('/:id', taskController.deleteTask);

export default router;
