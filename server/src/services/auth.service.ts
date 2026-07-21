import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../database/index.js';
import { users } from '../database/schema.js';
import { config } from '../config/index.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/AppError.js';

export const authService = {
  register: async (email: string, password: string, name: string) => {
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) throw new ConflictError('Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);

    const [user] = await db
      .insert(users)
      .values({ email, name, passwordHash })
      .returning({ id: users.id, email: users.email, name: users.name });

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: '7d' } as jwt.SignOptions
    );

    return { user, accessToken };
  },

  login: async (email: string, password: string) => {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user || !user.passwordHash) throw new UnauthorizedError('Invalid email or password');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid email or password');

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: '7d' } as jwt.SignOptions
    );

    return {
      user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
      accessToken,
    };
  },

  getMe: async (userId: string) => {
    const [user] = await db
      .select({ id: users.id, email: users.email, name: users.name, avatar: users.avatar })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) throw new NotFoundError('User not found');
    return user;
  },
};