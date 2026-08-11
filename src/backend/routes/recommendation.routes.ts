import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { RecommendationEngine, RecommendationRequest } from '../services/recommendation/engine.service';
import prisma from '../config/prisma';

const router = Router();

/**
 * @swagger
 * /api/recommendations/generate:
 *   post:
 *     summary: Generate an AI Seed Recommendation
 *     security: [{bearerAuth: []}]
 */
router.post('/generate', requireAuth, async (req, res, next) => {
  try {
    const request: RecommendationRequest = {
      userId: req.user!.id,
      ...req.body
    };

    if (!request.lat || !request.lng || !request.season || !request.state || !request.soilType) {
      return res.status(400).json({ error: 'Missing required parameters: lat, lng, season, state, soilType' });
    }

    const result = await RecommendationEngine.generate(request);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/recommendations/history:
 *   get:
 *     summary: Get user's recommendation history
 *     security: [{bearerAuth: []}]
 */
router.get('/history', requireAuth, async (req, res, next) => {
  try {
    const history = await prisma.recommendationHistory.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: { feedbacks: true }
    });
    res.json(history);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/recommendations/feedback:
 *   post:
 *     summary: Submit feedback for a past recommendation
 *     security: [{bearerAuth: []}]
 */
router.post('/feedback', requireAuth, async (req, res, next) => {
  try {
    const { historyId, actualYield, diseaseOccured, profit, satisfaction } = req.body;
    
    // Verify ownership
    const history = await prisma.recommendationHistory.findUnique({ where: { id: historyId } });
    if (!history || history.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const feedback = await prisma.recommendationFeedback.create({
      data: {
        historyId,
        actualYield,
        diseaseOccured: !!diseaseOccured,
        profit,
        satisfaction
      }
    });

    res.json(feedback);
  } catch (err) {
    next(err);
  }
});

export default router;
