import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { requireAuth } from '../middlewares/auth.middleware';
import prisma from '../config/prisma';
import * as aiHistoryService from '../services/aiHistory.service';

const router = Router();

/**
 * @swagger
 * /api/ai/history:
 *   get:
 *     summary: Get current user's AI interaction history
 *     security: [{bearerAuth: []}]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [CHAT, VISION, VIDEO, SEARCH, IMAGE_GEN] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Paginated AI history records }
 */
router.get('/history', requireAuth, async (req, res, next) => {
  try {
    const type = req.query.type as string | undefined;
    const page = Number(req.query.page) || 1;
    const result = await aiHistoryService.getUserHistory(req.user!.id, type, page);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/fertilizer', requireAuth, async (req, res, next) => {
  try {
    const apiKey = process.env.FERTILIZER_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Fertilizer API key is missing.");

    const ai = new GoogleGenAI({ apiKey });
    
    const { cropType, soilType, nitrogen, phosphorus, potassium, ph } = req.body;
    
    const prompt = `You are an expert agronomist AI.
I have a field with the following soil test metrics:
Crop: ${cropType}
Soil Type: ${soilType}
Nitrogen (N): ${nitrogen} mg/kg
Phosphorus (P): ${phosphorus} mg/kg
Potassium (K): ${potassium} mg/kg
pH: ${ph}

Please provide a precise, custom-blended fertilizer recommendation. 
DO NOT give a generic standard recommendation. You MUST mathematically adjust the baseline requirement based on the exact N, P, K, and pH values provided above.
Return the output STRICTLY as a JSON object with the following schema:
{
  "urea_kg_per_ha": number,
  "dap_kg_per_ha": number,
  "mop_kg_per_ha": number,
  "timing_rule": "string explaining when to apply, mentioning the specific soil pH and NPK conditions"
}`;

    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash",
      input: prompt
    });
    
    let textOutput = "";
    for (const step of interaction.steps) {
      if (step.type === 'model_output') {
        const textContent = step.content?.find((c: any) => c.type === 'text') as any;
        if (textContent && textContent.text) {
          textOutput += textContent.text;
        }
      }
    }
    
    // Parse the JSON string
    try {
      // Clean up markdown code blocks if present
      const cleaned = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      res.json(parsed);
    } catch (e) {
      console.error("Failed to parse Gemini output:", textOutput);
      res.status(500).json({ error: "Failed to parse AI response." });
    }
    
  } catch (err) { 
    next(err); 
  }
});

export default router;
