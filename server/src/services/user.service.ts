import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../database/index.js';
import { users } from '../database/schema.js';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/AppError.js';

export const userService = {
  getProfile: async (userId: string) => {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatar: users.avatar,
        provider: users.provider,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  },

  updateProfile: async (userId: string, data: { name?: string; avatar?: string }) => {
    const [existing] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!existing) {
      throw new NotFoundError('User not found');
    }

    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        avatar: users.avatar,
      });

    return updated;
  },

  changePassword: async (userId: string, currentPassword: string, newPassword: string) => {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.passwordHash) {
      throw new BadRequestError('Password not set. Login with OAuth.');
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestError('Current password is incorrect');
    }

    if (newPassword.length < 8) {
      throw new BadRequestError('New password must be at least 8 characters');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));
  },

  deleteAccount: async (userId: string) => {
    const [existing] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!existing) {
      throw new NotFoundError('User not found');
    }

    await db.delete(users).where(eq(users.id, userId));
  },
};