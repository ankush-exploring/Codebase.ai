import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const userController = {
  getProfile: asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
      return;
    }

    const user = await userService.getProfile(userId);
    res.json({ success: true, data: user });
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
      return;
    }

    const user = await userService.updateProfile(userId, req.body);
    res.json({ success: true, data: user });
  }),

  changePassword: asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    await userService.changePassword(userId, currentPassword, newPassword);

    res.json({ success: true, data: { message: 'Password changed successfully' } });
  }),

  deleteAccount: asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
      return;
    }

    await userService.deleteAccount(userId);
    res.clearCookie('refreshToken');
    res.json({ success: true, data: { message: 'Account deleted' } });
  }),
};