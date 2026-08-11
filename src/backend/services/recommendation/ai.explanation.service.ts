import { GoogleGenAI } from '@google/genai';
import { ScoredSeed } from './scoring.service';
import { GatheredContext } from './data-gatherer.service';

export async function generateExplanation(
  seed: ScoredSeed,
  context: GatheredContext
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Gemini API key is not configured. Falling back to generic explanation.');
    return `Based on our rule engine, ${seed.seedName} (${seed.cropName}) is highly recommended for your farm.`;
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are an expert agronomist AI acting as an explanation layer for an algorithmic Seed Recommendation Engine.
We have selected the seed "${seed.seedName}" (Crop: ${seed.cropName}) for this farmer based on a strict scoring algorithm.
It scored ${seed.finalScore}/100.

FARM CONTEXT:
- Farm Size: ${context.farmArea} hectares
- State: ${context.state}
- District: ${context.district}
- Soil: ${context.soilType}
- Season: ${context.season}
- Weather forecast indicates: ${context.weather?.description || 'normal conditions'}

Please generate a short, farmer-friendly explanation (max 3-4 paragraphs) covering:
1. Why this seed is suitable for their specific soil and season.
2. Any benefits and risks (e.g. weather impacts).
3. Preventive guidance (e.g. fertilizer/pest advice if relevant).
4. Estimated yield outlook if provided (${seed.yieldEstMin || 'N/A'} - ${seed.yieldEstMax || 'N/A'} q/ha).

Do NOT suggest alternative seeds. Just explain why this algorithmic choice is good. Keep the tone helpful and professional.`;

  try {
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

    return textOutput.trim() || `Based on our rule engine, ${seed.seedName} is highly recommended.`;
  } catch (error) {
    console.error("AI Explanation Generation Failed:", error);
    return `Based on our rule engine, ${seed.seedName} is highly recommended due to your soil and season.`;
  }
}
