import { gatherContext } from './data-gatherer.service';
import { scoreSeeds, ScoredSeed } from './scoring.service';
import { generateExplanation } from './ai.explanation.service';
import prisma from '../../config/prisma';

export interface RecommendationRequest {
  userId: string;
  lat: number;
  lng: number;
  season: string;
  state: string;
  district: string;
  soilType: string;
  ph?: number;
  n?: number;
  p?: number;
  k?: number;
}

export interface RecommendationResponse {
  topRecommendations: ScoredSeed[];
  aiExplanation: string | null;
  historyId: string;
}

export class RecommendationEngine {
  
  static async generate(req: RecommendationRequest): Promise<RecommendationResponse> {
    
    // 1. Gather all inputs (Weather, Farm Profile, Soil, location)
    const context = await gatherContext(
      req.userId, req.lat, req.lng, req.season, req.state, req.district, 
      req.soilType, req.ph, req.n, req.p, req.k
    );

    // 2. Score seeds using Rule Engine & hard constraints
    const rankedSeeds = await scoreSeeds(context);

    // 3. AI Explanation for the top seed
    let explanation = null;
    if (rankedSeeds.length > 0) {
      explanation = await generateExplanation(rankedSeeds[0], context);
    }

    // 4. Save to History
    const history = await prisma.recommendationHistory.create({
      data: {
        userId: req.userId,
        inputParams: context as any,
        results: rankedSeeds as any,
        explanation
      }
    });

    return {
      topRecommendations: rankedSeeds,
      aiExplanation: explanation,
      historyId: history.id
    };
  }

}
