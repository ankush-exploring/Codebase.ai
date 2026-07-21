import { Request, Response } from 'express';
import { repositoryService } from '../services/repository.service.js';
import { parserService } from '../services/parser.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BadRequestError } from '../utils/AppError.js';

export const repositoryController = {
  importByUrl: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { url, branch, name } = req.body;

    const repo = await repositoryService.importByUrl(userId, url, branch, name);

    res.status(201).json({ success: true, data: repo });
  }),

  importByZip: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    if (!req.file) throw new BadRequestError('No file uploaded');

    const repo = await repositoryService.importByZip(userId, req.file.path, req.body.name);

    res.status(201).json({ success: true, data: repo });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const repos = await repositoryService.listByUser(userId);
    res.json({ success: true, data: repos });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const repo = await repositoryService.getById(userId, id);
    res.json({ success: true, data: repo });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    await repositoryService.delete(userId, id);
    res.json({ success: true, data: { message: 'Repository deleted' } });
  }),

  parse: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const repo = await parserService.parseRepository(userId, id);
    res.json({ success: true, data: repo });
  }),
};