import { Engine } from 'json-rules-engine';
import prisma from '../../config/prisma';
import getRedis from '../../config/redis';

let engineCache: Engine | null = null;

export async function getRuleEngine(): Promise<Engine> {
  if (engineCache) return engineCache;

  const redis = getRedis();
  let rulesData: any[] = [];
  
  try {
    const cached = await redis.get('recommendation_rules');
    if (cached) {
      rulesData = JSON.parse(cached);
    }
  } catch (e) {
    console.error('Redis cache error', e);
  }

  if (rulesData.length === 0) {
    const activeRules = await prisma.recommendationRule.findMany({
      where: { isActive: true }
    });
    
    rulesData = activeRules.map(r => ({
      conditions: r.conditions,
      event: {
        type: 'impact',
        params: {
          impact: r.impact,
          ruleName: r.name
        }
      }
    }));
    
    try {
      await redis.set('recommendation_rules', JSON.stringify(rulesData), 'EX', 3600);
    } catch (e) {
      console.error('Redis set error', e);
    }
  }

  const engine = new Engine();
  rulesData.forEach(rule => {
    try {
      engine.addRule(rule as any);
    } catch(err) {
      console.error(`Failed to load rule`, err);
    }
  });

  engineCache = engine;
  return engine;
}

export async function invalidateEngineCache() {
  engineCache = null;
  const redis = getRedis();
  try {
    await redis.del('recommendation_rules');
  } catch(e) {}
}

export async function evaluateRules(context: any): Promise<any[]> {
  const engine = await getRuleEngine();
  const { events } = await engine.run(context);
  return events.map(e => e.params);
}
