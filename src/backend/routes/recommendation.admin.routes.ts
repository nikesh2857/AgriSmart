import { Router } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import prisma from '../config/prisma';
import getRedis from '../config/redis';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Helper to parse arrays from CSV string like "KHARIF,RABI"
const parseArray = (str: string) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];
const parseFloatNullable = (str: string) => str && !isNaN(parseFloat(str)) ? parseFloat(str) : null;

/**
 * @swagger
 * /api/admin/recommendations/import-seeds:
 *   post:
 *     summary: Bulk import seeds via CSV
 *     security: [{bearerAuth: []}]
 */
router.post('/import-seeds', requireAuth, requireRole(['ADMIN']), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file provided' });
    }

    const results: any[] = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          let imported = 0;
          for (const row of results) {
            // Upsert Category
            const category = await prisma.cropCategory.upsert({
              where: { name: row.categoryName || 'General' },
              update: {},
              create: { name: row.categoryName || 'General' }
            });

            // Upsert Crop
            const crop = await prisma.crop.upsert({
              where: { name: row.cropName },
              update: { categoryId: category.id },
              create: { name: row.cropName, categoryId: category.id }
            });

            // Create Seed Variety
            await prisma.seedVariety.create({
              data: {
                cropId: crop.id,
                name: row.varietyName,
                brand: row.brand || null,
                growingSeason: parseArray(row.growingSeason),
                suitableStates: parseArray(row.suitableStates),
                suitableDistricts: parseArray(row.suitableDistricts),
                suitableSoilTypes: parseArray(row.suitableSoilTypes),
                waterReqMin: parseFloatNullable(row.waterReqMin),
                waterReqMax: parseFloatNullable(row.waterReqMax),
                tempRangeMin: parseFloatNullable(row.tempRangeMin),
                tempRangeMax: parseFloatNullable(row.tempRangeMax),
                rainfallMin: parseFloatNullable(row.rainfallMin),
                rainfallMax: parseFloatNullable(row.rainfallMax),
                diseaseResistance: parseArray(row.diseaseResistance),
                pestResistance: parseArray(row.pestResistance),
                yieldEstMin: parseFloatNullable(row.yieldEstMin),
                yieldEstMax: parseFloatNullable(row.yieldEstMax),
              }
            });
            imported++;
          }
          
          // Clean up file
          fs.unlinkSync(req.file!.path);
          
          res.json({ message: `Successfully imported ${imported} seed varieties.` });
        } catch (err) {
          console.error("Import error", err);
          fs.unlinkSync(req.file!.path);
          res.status(500).json({ error: 'Database import failed' });
        }
      });

  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/admin/recommendations/rules:
 *   post:
 *     summary: Create or update a recommendation rule
 *     security: [{bearerAuth: []}]
 */
router.post('/rules', requireAuth, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const { name, description, conditions, impact, isActive } = req.body;
    
    const rule = await prisma.recommendationRule.create({
      data: {
        name,
        description,
        conditions,
        impact,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    
    // Invalidate rule cache
    const redis = getRedis();
    await redis.del('recommendation_rules');
    
    res.json(rule);
  } catch (err) {
    next(err);
  }
});

export default router;
