import { Request, Response } from 'express';
import { codeUnderstandingService } from '../services/codeUnderstanding.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BadRequestError } from '../utils/AppError.js';

export const codeUnderstandingController = {
  explain: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { taskType, targetPath, query } = req.body;

    if (!taskType || !targetPath) {
      throw new BadRequestError('taskType and targetPath are required');
    }

    const validTypes = ['explain-function', 'explain-class', 'explain-file', 'explain-folder', 'ask-question'];
    if (!validTypes.includes(taskType)) {
      throw new BadRequestError(`Invalid taskType. Must be one of: ${validTypes.join(', ')}`);
    }

    const result = await codeUnderstandingService.explain(
      id,
      taskType as any,
      targetPath,
      query
    );

    res.json({ success: true, data: result });
  }),

  getFileTree: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tree = await codeUnderstandingService.getFileTree(id);
    res.json({ success: true, data: tree });
  }),

  getFileInfo: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const filePath = req.query.path as string;

    if (!filePath) {
      throw new BadRequestError('path query parameter is required');
    }

    const result = await codeUnderstandingService.getFileInfo(id, filePath);
    res.json({ success: true, data: result });
  }),
};