import prisma from '../../config/prisma';
import { evaluateRules } from './rules.service';
import { GatheredContext } from './data-gatherer.service';

export interface ScoredSeed {
  seedId: string;
  seedName: string;
  cropName: string;
  baseScore: number;
  finalScore: number;
  yieldEstMin: number | null;
  yieldEstMax: number | null;
  appliedRules: any[];
}

export async function scoreSeeds(context: GatheredContext): Promise<ScoredSeed[]> {
  // 1. Fetch all seeds (In production, this would be heavily cached or filtered at DB level)
  const allSeeds = await prisma.seedVariety.findMany({
    include: { crop: true }
  });

  // 2. Filter by hard constraints (State & Season)
  const validSeeds = allSeeds.filter(seed => {
    // Check State constraint
    if (seed.suitableStates && seed.suitableStates.length > 0) {
      if (!seed.suitableStates.includes(context.state)) return false;
    }
    // Check Season constraint
    if (seed.growingSeason && seed.growingSeason.length > 0) {
      if (!seed.growingSeason.includes(context.season)) return false;
    }
    // Check Soil constraint
    if (seed.suitableSoilTypes && seed.suitableSoilTypes.length > 0) {
      if (!seed.suitableSoilTypes.includes(context.soilType)) return false;
    }
    return true;
  });

  if (validSeeds.length === 0) return [];

  // 3. Evaluate dynamic rules via Engine
  // We run the engine once with the context
  const ruleImpacts = await evaluateRules(context);

  // 4. Calculate Scores
  const scoredSeeds: ScoredSeed[] = validSeeds.map(seed => {
    let baseScore = 50; // Starting baseline
    
    // Apply basic agronomic heuristics based on context
    if (context.weather && seed.tempRangeMin && seed.tempRangeMax) {
      const t = context.weather.temp;
      if (t >= seed.tempRangeMin && t <= seed.tempRangeMax) {
        baseScore += 10;
      } else {
        baseScore -= 10;
      }
    }

    if (context.weather && seed.rainfallMin && seed.rainfallMax) {
      // Very crude heuristic for demonstration
      if (context.weather.isRaining) {
        baseScore += 5; 
      }
    }

    let finalScore = baseScore;
    let appliedRules: any[] = [];

    // Apply Impacts from rule engine
    for (const impactObj of ruleImpacts) {
      const impact = impactObj.impact as any;
      
      // If the impact applies to this specific crop or variety
      if (impact.targetCrop === seed.crop.name || impact.targetVariety === seed.name) {
        if (impact.score) {
          finalScore += Number(impact.score);
        }
        appliedRules.push(impactObj.ruleName);
      }
      
      // Global impacts
      if (impact.targetAll) {
        if (impact.score) finalScore += Number(impact.score);
        appliedRules.push(impactObj.ruleName);
      }
    }

    // Clamp score
    finalScore = Math.max(0, Math.min(100, finalScore));

    return {
      seedId: seed.id,
      seedName: seed.name,
      cropName: seed.crop.name,
      baseScore,
      finalScore,
      yieldEstMin: seed.yieldEstMin,
      yieldEstMax: seed.yieldEstMax,
      appliedRules
    };
  });

  // 5. Sort by highest score
  scoredSeeds.sort((a, b) => b.finalScore - a.finalScore);

  return scoredSeeds.slice(0, 5); // Return top 5
}
