import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import getRedis from '../config/redis';

const router = Router();

const COMMODITIES = [
  { id: 1, name: 'Wheat' },
  { id: 3, name: 'Rice' },
  { id: 15, name: 'Cotton' },
  { id: 150, name: 'Sugarcane' },
  { id: 4, name: 'Maize' },
];

const CEDA_API_URL = 'https://api.ceda.ashoka.edu.in/v1/agmarknet/prices';

// Fallback mock data if API fails or has no data
const getFallbackData = (scope: string) => {
  const currentPrices = {
    wheat: scope === 'local' ? 2200 : scope === 'state' ? 2250 : 2300,
    rice: scope === 'local' ? 3100 : scope === 'state' ? 3150 : 3200,
    cotton: scope === 'local' ? 7000 : scope === 'state' ? 7100 : 7200,
    sugarcane: scope === 'local' ? 300 : scope === 'state' ? 310 : 320,
    maize: scope === 'local' ? 1800 : scope === 'state' ? 1850 : 1900
  };

  return [
    { crop: 'Wheat', currentPrice: currentPrices.wheat, previousPrice: currentPrices.wheat - 50, trend: '+2.3%', trendDirection: 'up', demand: 'High', updated: '2 hours ago' },
    { crop: 'Rice (Paddy)', currentPrice: currentPrices.rice, previousPrice: currentPrices.rice + 100, trend: '-3.1%', trendDirection: 'down', demand: 'Medium', updated: '5 hours ago' },
    { crop: 'Cotton', currentPrice: currentPrices.cotton, previousPrice: currentPrices.cotton - 150, trend: '+2.1%', trendDirection: 'up', demand: 'High', updated: '1 hour ago' },
    { crop: 'Sugarcane', currentPrice: currentPrices.sugarcane, previousPrice: currentPrices.sugarcane, trend: '0.0%', trendDirection: 'neutral', demand: 'Stable', updated: '1 day ago' },
    { crop: 'Maize', currentPrice: currentPrices.maize, previousPrice: currentPrices.maize - 40, trend: '+1.5%', trendDirection: 'up', demand: 'Stable', updated: '3 hours ago' }
  ];
};

const getMockHistory = (crop: string) => {
  const basePrices: Record<string, number> = {
    wheat: 2200,
    rice: 3100,
    cotton: 7000,
    sugarcane: 300,
    maize: 1800
  };
  
  const key = crop.toLowerCase().includes('rice') ? 'rice' : crop.toLowerCase();
  const basePrice = basePrices[key] || 2000;
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days.map((day, idx) => ({
    date: day,
    price: basePrice + Math.round((Math.sin(idx) * 100) + (Math.cos(idx / 2) * 50))
  }));
};

const fetchMarketRatesFromAPI = async () => {
  const apiKey = process.env.CEDA_API_KEY;
  if (!apiKey) {
    throw new Error("Missing CEDA_API_KEY");
  }

  // The CEDA API contains historical data. Querying the current year (2026) returns no data.
  // We use late 2024 as the date range to get the latest available realistic data.
  const to_date = '2024-12-31';
  const from_date = '2024-09-01';

  const results = [];

  // Helper for rate-limiting
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  for (const commodity of COMMODITIES) {
    try {
      // Add a 1-second delay between requests to avoid CEDA API 429 Too Many Requests
      await delay(1000);

      const response = await fetch(CEDA_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          commodity_id: commodity.id,
          state_id: 0, // All India level
          from_date,
          to_date
        })
      });

      const json = await response.json();
      
      if (json.output && json.output.type === 'success' && json.output.data && json.output.data.length > 0) {
        // Sort data by date descending
        const sortedData = json.output.data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const latest = sortedData[0];
        const previous = sortedData.length > 1 ? sortedData[1] : latest;

        const currentPrice = latest.modal_price || latest.max_price || 0;
        const previousPrice = previous.modal_price || previous.max_price || currentPrice;
        
        let trend = '0.0%';
        let trendDirection = 'neutral';
        
        if (currentPrice > previousPrice && previousPrice > 0) {
          trend = '+' + ((currentPrice - previousPrice) / previousPrice * 100).toFixed(1) + '%';
          trendDirection = 'up';
        } else if (currentPrice < previousPrice && previousPrice > 0) {
          trend = '-' + ((previousPrice - currentPrice) / previousPrice * 100).toFixed(1) + '%';
          trendDirection = 'down';
        }

        results.push({
          crop: commodity.name,
          currentPrice: Math.round(currentPrice),
          previousPrice: Math.round(previousPrice),
          trend,
          trendDirection,
          demand: 'Medium', // API doesn't provide demand, fallback to Medium
          updated: new Date(latest.date).toLocaleDateString()
        });
      }
    } catch (err) {
      console.error(`Failed to fetch CEDA data for ${commodity.name}:`, err);
    }
  }

  return results;
};

/**
 * @swagger
 * /api/market-rates:
 *   get:
 *     summary: Fetch current market rates for crops
 *     security: [{bearerAuth: []}]
 */
/**
 * @swagger
 * /api/market-rates/history:
 *   get:
 *     summary: Fetch historical market rates for a specific crop
 *     security: [{bearerAuth: []}]
 *     parameters:
 *       - in: query
 *         name: crop
 *         schema:
 *           type: string
 *         required: false
 */
router.get('/history', requireAuth, async (req, res) => {
  const crop = req.query.crop as string || 'Wheat';
  const cacheKey = `market_rates:history:${crop.toLowerCase()}`;
  const redis = getRedis();
  
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    const commodity = COMMODITIES.find(c => 
      c.name.toLowerCase() === crop.toLowerCase() || 
      (crop.toLowerCase().includes('rice') && c.name === 'Rice')
    );
    
    if (!commodity) {
      return res.status(400).json({ error: 'Invalid commodity name' });
    }
    
    const apiKey = process.env.CEDA_API_KEY;
    if (!apiKey) {
      return res.json(getMockHistory(crop));
    }
    
    const to_date = '2024-12-31';
    const from_date = '2024-09-01';
    
    const response = await fetch(CEDA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        commodity_id: commodity.id,
        state_id: 0,
        from_date,
        to_date
      })
    });
    
    const json = await response.json();
    if (json.output && json.output.type === 'success' && json.output.data && json.output.data.length > 0) {
      const sorted = json.output.data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      const result = sorted.map((d: any) => ({
        date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        price: d.modal_price || d.max_price || 0
      })).filter((d: any) => d.price > 0);
      
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 6 * 60 * 60);
      return res.json(result);
    } else {
      return res.json(getMockHistory(crop));
    }
  } catch (err: any) {
    console.error(`Failed to fetch history for ${crop}:`, err);
    return res.json(getMockHistory(crop));
  }
});

router.get('/', requireAuth, async (req, res) => {
  const scope = req.query.scope as string || 'local';
  
  // Only use API for 'state' or 'all-india', fallback logic for local scope or just unify them
  const cacheKey = `market_rates:ceda`;
  const redis = getRedis();
  
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    const apiData = await fetchMarketRatesFromAPI();
    
    if (apiData.length > 0) {
      // Cache for 6 hours to minimize credit consumption
      await redis.set(cacheKey, JSON.stringify(apiData), 'EX', 6 * 60 * 60);
      return res.json(apiData);
    } else {
      console.warn("CEDA API returned no data, using fallback.");
      return res.json(getFallbackData(scope));
    }
  } catch (err) {
    console.error("Error fetching market rates:", err);
    return res.json(getFallbackData(scope));
  }
});

export default router;
