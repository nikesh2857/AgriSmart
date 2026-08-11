import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import prisma from '../config/prisma';

const router = express.Router();

// GET /api/erp/dashboard
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;

    // 1. Fetch Farm Area
    let farmProfile = await prisma.farmProfile.findUnique({
      where: { userId }
    });
    
    // Auto-create profile if missing
    if (!farmProfile) {
      farmProfile = await prisma.farmProfile.create({
        data: { userId, totalArea: 45.0 } // Default for now
      });
    }

    // 2. Active Laborers (count workers assigned to IN_PROGRESS jobs for this farmer)
    const activeLaborersCount = await prisma.jobAssignment.count({
      where: {
        status: 'ASSIGNED',
        job: {
          farmerId: userId,
          status: 'IN_PROGRESS'
        }
      }
    });

    // 3. Next Major Action (earliest pending job)
    const nextJob = await prisma.job.findFirst({
      where: {
        farmerId: userId,
        status: 'PENDING',
        dateTime: { gte: new Date() }
      },
      orderBy: { dateTime: 'asc' }
    });

    let nextAction = null;
    if (nextJob) {
      const daysUntil = Math.ceil((new Date(nextJob.dateTime).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      nextAction = {
        name: nextJob.workName,
        timeText: daysUntil === 0 ? 'Today' : `Starts in ${daysUntil} days`
      };
    }

    // 4. Financial Records
    const records = await prisma.financialRecord.findMany({
      where: { userId },
      orderBy: { date: 'asc' }
    });

    // Seed dummy financial data if empty just to show charts
    if (records.length === 0) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const dummyData = [
        { income: 4000, expense: 2400 },
        { income: 3000, expense: 1398 },
        { income: 2000, expense: 9800 },
        { income: 2780, expense: 3908 },
        { income: 1890, expense: 4800 },
        { income: 2390, expense: 3800 },
      ];
      
      for (let i = 0; i < dummyData.length; i++) {
        await prisma.financialRecord.create({
          data: {
            userId,
            type: 'INCOME',
            amount: dummyData[i].income,
            category: 'Sales',
            date: new Date(`2026-${String(i+1).padStart(2, '0')}-01`)
          }
        });
        await prisma.financialRecord.create({
          data: {
            userId,
            type: 'EXPENSE',
            amount: dummyData[i].expense,
            category: 'Supplies',
            date: new Date(`2026-${String(i+1).padStart(2, '0')}-01`)
          }
        });
      }
    }

    // Fetch again to aggregate
    const allRecords = await prisma.financialRecord.findMany({
      where: { userId },
      orderBy: { date: 'asc' }
    });

    const finDataMap: Record<string, { month: string, income: number, expense: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    allRecords.forEach(record => {
      const date = new Date(record.date);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      if (!finDataMap[monthKey]) {
        finDataMap[monthKey] = { month: monthKey, income: 0, expense: 0 };
      }
      if (record.type === 'INCOME') finDataMap[monthKey].income += Number(record.amount);
      if (record.type === 'EXPENSE') finDataMap[monthKey].expense += Number(record.amount);
    });

    const finData = Object.values(finDataMap);

    // 5. Plots for Crop Timeline
    let plots = await prisma.plot.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });

    // Seed dummy plots if none exist
    if (plots.length === 0) {
      plots = [
        await prisma.plot.create({ data: { userId, name: 'Plot A', crop: 'Wheat', area: 20, status: 'Growing Phase' } }),
        await prisma.plot.create({ data: { userId, name: 'Plot B', crop: 'Rice', area: 25, status: 'Irrigation & Prep' } })
      ];
    }

    res.json({
      farmArea: Number(farmProfile.totalArea),
      activeLaborers: activeLaborersCount,
      nextAction,
      finData,
      plots
    });
  } catch (error) {
    console.error('ERP dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// GET /api/erp/workers/live
router.get('/workers/live', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    
    const where: any = {};
    if (role !== 'ADMIN') {
      where.job = { farmerId: userId };
    }
    
    const assignments = await prisma.jobAssignment.findMany({
      where,
      include: {
        job: { select: { status: true } }
      }
    });

    const activeWorkers = {
      travelling: assignments.filter(a => a.job.status === 'ACCEPTED' && !a.checkInAt).length,
      arrived: assignments.filter(a => a.job.status === 'ACCEPTED' && a.checkInAt && !a.checkOutAt).length,
      working: assignments.filter(a => a.job.status === 'IN_PROGRESS').length,
      finished: assignments.filter(a => a.checkOutAt || a.job.status === 'COMPLETED').length
    };

    res.json(activeWorkers);
  } catch (error) {
    console.error('Failed to fetch live workers:', error);
    res.status(500).json({ error: 'Failed to fetch live workers' });
  }
});

// GET /api/erp/contacts
router.get('/contacts', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    
    if (role === 'WORKER') {
      const assignments = await prisma.jobAssignment.findMany({
        where: { workerId: userId },
        include: {
          job: {
            include: {
              farmer: { select: { id: true, name: true, email: true, avatarUrl: true } }
            }
          }
        }
      });
      
      // Deduplicate contacts by farmer ID
      const seen = new Set();
      const contacts = [];
      for (const a of assignments) {
        if (!a.job.farmer) continue;
        if (!seen.has(a.job.farmer.id)) {
          seen.add(a.job.farmer.id);
          contacts.push({
            id: a.job.farmer.id,
            name: a.job.farmer.name || 'Farmer',
            email: a.job.farmer.email,
            avatarUrl: a.job.farmer.avatarUrl,
            jobName: a.job.workName,
            role: 'Farmer'
          });
        }
      }
      
      return res.json(contacts);
    } else {
      // Farmer or Admin
      const where: any = {};
      if (role !== 'ADMIN') {
        where.job = { farmerId: userId };
      }
      
      const assignments = await prisma.jobAssignment.findMany({
        where,
        include: {
          worker: { select: { id: true, name: true, email: true, avatarUrl: true } },
          job: { select: { workName: true } }
        }
      });
      
      // Deduplicate contacts by worker ID
      const seen = new Set();
      const contacts = [];
      for (const a of assignments) {
        if (!a.worker) continue;
        if (!seen.has(a.worker.id)) {
          seen.add(a.worker.id);
          contacts.push({
            id: a.worker.id,
            name: a.worker.name || 'Worker',
            email: a.worker.email,
            avatarUrl: a.worker.avatarUrl,
            jobName: a.job.workName,
            role: 'Worker'
          });
        }
      }
      
      return res.json(contacts);
    }
  } catch (error) {
    console.error('Failed to fetch contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

export default router;
