import prisma from '../src/backend/config/prisma';

async function main() {
  console.log("Seeding AI Recommendation Knowledge Base...");

  // 1. Categories
  const cereals = await prisma.cropCategory.upsert({ where: { name: 'Cereals' }, update: {}, create: { name: 'Cereals' } });
  const cashCrops = await prisma.cropCategory.upsert({ where: { name: 'Cash Crops' }, update: {}, create: { name: 'Cash Crops' } });
  const pulses = await prisma.cropCategory.upsert({ where: { name: 'Pulses' }, update: {}, create: { name: 'Pulses' } });
  const oilseeds = await prisma.cropCategory.upsert({ where: { name: 'Oilseeds' }, update: {}, create: { name: 'Oilseeds' } });

  // 2. Crops
  const wheat = await prisma.crop.upsert({ where: { name: 'Wheat' }, update: {}, create: { name: 'Wheat', categoryId: cereals.id } });
  const rice = await prisma.crop.upsert({ where: { name: 'Rice' }, update: {}, create: { name: 'Rice', categoryId: cereals.id } });
  const maize = await prisma.crop.upsert({ where: { name: 'Maize' }, update: {}, create: { name: 'Maize', categoryId: cereals.id } });
  const cotton = await prisma.crop.upsert({ where: { name: 'Cotton' }, update: {}, create: { name: 'Cotton', categoryId: cashCrops.id } });
  const sugarcane = await prisma.crop.upsert({ where: { name: 'Sugarcane' }, update: {}, create: { name: 'Sugarcane', categoryId: cashCrops.id } });
  const greenGram = await prisma.crop.upsert({ where: { name: 'Green Gram (Moong)' }, update: {}, create: { name: 'Green Gram (Moong)', categoryId: pulses.id } });
  const groundnut = await prisma.crop.upsert({ where: { name: 'Groundnut' }, update: {}, create: { name: 'Groundnut', categoryId: oilseeds.id } });

  // 3. Seed Varieties
  await prisma.seedVariety.deleteMany({});

  await prisma.seedVariety.createMany({
    data: [
      // WHEAT
      {
        cropId: wheat.id, name: 'HD-2967', brand: 'Pusa', growingSeason: ['RABI'],
        suitableStates: ['PUNJAB', 'HARYANA', 'UP', 'DELHI', 'MAHARASHTRA', 'BIHAR', 'MADHYA PRADESH', 'RAJASTHAN'],
        suitableDistricts: [], suitableSoilTypes: ['ALLUVIAL', 'LOAMY', 'BLACK SOIL'],
        waterReqMin: 300, waterReqMax: 450, tempRangeMin: 10, tempRangeMax: 25, yieldEstMin: 45, yieldEstMax: 55,
      },
      // RICE (Universal Kharif)
      {
        cropId: rice.id, name: 'IR64 (High Yield)', brand: 'Generic', growingSeason: ['KHARIF'],
        suitableStates: [], // Empty means ALL STATES
        suitableDistricts: [], suitableSoilTypes: ['ALLUVIAL', 'LOAMY', 'BLACK SOIL', 'RED SOIL'],
        waterReqMin: 900, waterReqMax: 1500, tempRangeMin: 22, tempRangeMax: 32, yieldEstMin: 50, yieldEstMax: 65,
      },
      // RICE (South India Specific)
      {
        cropId: rice.id, name: 'Ponni Rice (BPT 5204)', brand: 'Generic', growingSeason: ['KHARIF', 'RABI'],
        suitableStates: ['TAMIL NADU', 'KERALA', 'KARNATAKA', 'ANDHRA PRADESH', 'TELANGANA'],
        suitableDistricts: [], suitableSoilTypes: ['ALLUVIAL', 'RED SOIL', 'LOAMY'],
        waterReqMin: 1000, waterReqMax: 1500, tempRangeMin: 25, tempRangeMax: 35, yieldEstMin: 40, yieldEstMax: 50,
      },
      // MAIZE (Universal)
      {
        cropId: maize.id, name: 'Pioneer 30V92', brand: 'Pioneer', growingSeason: ['KHARIF', 'RABI'],
        suitableStates: [], // Empty means ALL STATES
        suitableDistricts: [], suitableSoilTypes: ['ALLUVIAL', 'RED SOIL', 'LOAMY', 'BLACK SOIL'],
        waterReqMin: 400, waterReqMax: 600, tempRangeMin: 20, tempRangeMax: 30, yieldEstMin: 60, yieldEstMax: 80,
      },
      // COTTON (Black Soil)
      {
        cropId: cotton.id, name: 'Bt Cotton Bollgard II', brand: 'Mahyco', growingSeason: ['KHARIF'],
        suitableStates: ['MAHARASHTRA', 'GUJARAT', 'TELANGANA', 'KARNATAKA', 'ANDHRA PRADESH', 'MADHYA PRADESH'],
        suitableDistricts: [], suitableSoilTypes: ['BLACK SOIL'],
        waterReqMin: 500, waterReqMax: 700, tempRangeMin: 21, tempRangeMax: 37, yieldEstMin: 20, yieldEstMax: 30,
      },
      // SUGARCANE (Universal)
      {
        cropId: sugarcane.id, name: 'Co 0238', brand: 'SBI', growingSeason: ['KHARIF', 'RABI'],
        suitableStates: ['UP', 'MAHARASHTRA', 'KARNATAKA', 'TAMIL NADU', 'BIHAR', 'GUJARAT'],
        suitableDistricts: [], suitableSoilTypes: ['ALLUVIAL', 'BLACK SOIL', 'LOAMY'],
        waterReqMin: 1500, waterReqMax: 2500, tempRangeMin: 25, tempRangeMax: 35, yieldEstMin: 700, yieldEstMax: 900,
      },
      // GREEN GRAM (Universal Zaid/Kharif)
      {
        cropId: greenGram.id, name: 'SML 668', brand: 'PAU', growingSeason: ['ZAID', 'KHARIF'],
        suitableStates: [], // ALL STATES
        suitableDistricts: [], suitableSoilTypes: ['LOAMY', 'RED SOIL', 'ALLUVIAL'],
        waterReqMin: 300, waterReqMax: 400, tempRangeMin: 25, tempRangeMax: 35, yieldEstMin: 12, yieldEstMax: 18,
      },
      // GROUNDNUT (Dry / Sandy / Red Soil)
      {
        cropId: groundnut.id, name: 'K6', brand: 'Generic', growingSeason: ['KHARIF', 'RABI'],
        suitableStates: ['GUJARAT', 'ANDHRA PRADESH', 'TAMIL NADU', 'KARNATAKA', 'MAHARASHTRA', 'RAJASTHAN'],
        suitableDistricts: [], suitableSoilTypes: ['RED SOIL', 'LOAMY'],
        waterReqMin: 400, waterReqMax: 600, tempRangeMin: 25, tempRangeMax: 35, yieldEstMin: 20, yieldEstMax: 25,
      }
    ]
  });

  // 4. Recommendation Rules
  await prisma.recommendationRule.deleteMany({});
  
  await prisma.recommendationRule.create({
    data: {
      name: 'Black Soil Premium for Cotton',
      description: 'Cotton performs exceptionally well in Black Soil.',
      isActive: true,
      conditions: {
        all: [
          { fact: 'soilType', operator: 'equal', value: 'BLACK SOIL' }
        ]
      },
      impact: {
        targetCrop: 'Cotton',
        score: 20
      }
    }
  });

  await prisma.recommendationRule.create({
    data: {
      name: 'High Heat Adaptability for Sugarcane',
      description: 'Sugarcane thrives in high heat and abundant water.',
      isActive: true,
      conditions: {
        all: [
          { fact: 'season', operator: 'in', value: ['KHARIF', 'RABI'] }
        ]
      },
      impact: {
        targetCrop: 'Sugarcane',
        score: 10
      }
    }
  });
  
  await prisma.recommendationRule.create({
    data: {
      name: 'Zaid Season Pulse Boost',
      description: 'Moong is excellent for the short summer season.',
      isActive: true,
      conditions: {
        all: [
          { fact: 'season', operator: 'equal', value: 'ZAID' }
        ]
      },
      impact: {
        targetCrop: 'Green Gram (Moong)',
        score: 25
      }
    }
  });

  console.log("Knowledge Base seeded successfully with universal coverage!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
