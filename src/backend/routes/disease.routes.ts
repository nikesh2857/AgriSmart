import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import fetch from 'node-fetch'; // or use built-in fetch if Node >= 18

const router = express.Router();

router.post('/analyze', requireAuth, async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const apiKey = process.env.PLANT_ID_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Plant.id API key is not configured.' });
    }

    // Strip data URL prefix if present (e.g. data:image/jpeg;base64,)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await fetch('https://api.plant.id/v3/identification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
      },
      body: JSON.stringify({
        images: [base64Data],
        health: 'all'
      })
    });

    if (!response.ok) {
      const errData = await response.text();
      console.error('Plant.id API error:', errData);
      return res.status(response.status).json({ error: 'Failed to analyze image with Plant.id' });
    }

    const data = (await response.json()) as any;
    
    // Parse response
    const result = data.result;
    if (!result) {
      return res.status(500).json({ error: 'Invalid response from Plant.id' });
    }

    let isHealthy = false;
    let healthyProbability = 0;
    
    if (result.is_healthy) {
      isHealthy = result.is_healthy.binary;
      healthyProbability = result.is_healthy.probability;
    }

    let primaryDisease = null;
    let suggestions = [];

    if (result.disease && result.disease.suggestions && result.disease.suggestions.length > 0) {
      suggestions = result.disease.suggestions;
      primaryDisease = suggestions[0];
    }

    let plantName = null;
    if (result.classification && result.classification.suggestions && result.classification.suggestions.length > 0) {
      plantName = result.classification.suggestions[0].name;
    }

    res.json({
      isHealthy,
      healthyProbability,
      primaryDisease,
      plantName,
      suggestions,
      raw: data
    });

  } catch (error) {
    console.error('Disease detection error:', error);
    res.status(500).json({ error: 'Internal server error during disease detection' });
  }
});

export default router;
