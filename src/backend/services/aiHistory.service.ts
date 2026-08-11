import prisma from '../config/prisma';
import { AiHistoryType } from '@prisma/client';

export const recordAiInteraction = async (opts: {
  userId: string;
  type: AiHistoryType;
  prompt: string;
  responseSummary: string;
  fileUrl?: string;
  tokensUsed?: number;
}) => {
  try {
    return await prisma.aiHistory.create({
      data: {
        userId: opts.userId,
        type: opts.type,
        prompt: opts.prompt,
        // Cap responseSummary at 500 chars to keep the record lean
        responseSummary: opts.responseSummary.slice(0, 500),
        fileUrl: opts.fileUrl ?? null,
        tokensUsed: opts.tokensUsed ?? null,
      },
    });
  } catch (err) {
    // Non-fatal — never let history logging break the user's request
    console.error('[AiHistory] Failed to record interaction:', err);
    return null;
  }
};

export const getUserHistory = async (userId: string, type?: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const where: any = { userId, ...(type && { type: type as AiHistoryType }) };

  const [records, total] = await Promise.all([
    prisma.aiHistory.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.aiHistory.count({ where }),
  ]);

  return { records, total, page, pages: Math.ceil(total / limit) };
};
