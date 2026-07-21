import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authController = {
  register: asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password, name } = req.body;
    const result = await authService.register(email, password, name);

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  }),

  login: asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  }),

  me: asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
      return;
    }

    const user = await authService.getMe(userId);
    res.json({ success: true, data: user });
  }),

  logout: asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    res.json({ success: true, data: { message: 'Logged out' } });
  }),
};