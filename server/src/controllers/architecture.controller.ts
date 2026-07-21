import { Request, Response } from 'express';
import { architectureService } from '../services/architecture.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const architectureController = {
  getFolderStructure: asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const mermaid = await architectureService.getFolderStructure(id);
    res.json({ success: true, data: { mermaid } });
  }),

  getDependencyGraph: asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const mermaid = await architectureService.getDependencyGraph(id);
    res.json({ success: true, data: { mermaid } });
  }),

  getApiFlow: asyncHandler(async (_req: Request, res: Response) => {
    const mermaid = await architectureService.getApiFlow();
    res.json({ success: true, data: { mermaid } });
  }),

  getDbSchema: asyncHandler(async (_req: Request, res: Response) => {
    const mermaid = await architectureService.getDbSchema();
    res.json({ success: true, data: { mermaid } });
  }),
};
