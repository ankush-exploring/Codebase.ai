import { Request, Response } from 'express';
import { ragService } from '../services/rag.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BadRequestError } from '../utils/AppError.js';

export const ragController = {
  embed: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const result = await ragService.embedRepository(userId, id);
    res.json({ success: true, data: result });
  }),

  query: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { query, topK } = req.body;

    if (!query || typeof query !== 'string') {
      throw new BadRequestError('query is required');
    }

    const result = await ragService.query(id, query, topK ?? 10);
    res.json({ success: true, data: result });
  }),
};