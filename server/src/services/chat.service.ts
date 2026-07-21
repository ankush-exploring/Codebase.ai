import { eq, and, desc } from 'drizzle-orm';
import { db } from '../database/index.js';
import { chats, messages } from '../database/schema.js';
import { NotFoundError } from '../utils/AppError.js';

export const chatService = {
  listByUser: async (userId: string) => {
    return db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(desc(chats.updatedAt));
  },

  create: async (userId: string, repositoryId?: string, title?: string) => {
    const [chat] = await db
      .insert(chats)
      .values({
        userId,
        repositoryId: repositoryId || null,
        title: title || 'New Chat',
      })
      .returning();
    return chat;
  },

  getById: async (userId: string, chatId: string) => {
    const [chat] = await db
      .select()
      .from(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
      .limit(1);
    if (!chat) throw new NotFoundError('Chat not found');
    return chat;
  },

  getMessages: async (chatId: string) => {
    return db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.createdAt);
  },

  addMessage: async (chatId: string, role: string, content: string, citations?: unknown[]) => {
    const [msg] = await db
      .insert(messages)
      .values({
        chatId,
        role,
        content,
        citations: citations || [],
      })
      .returning();

    await db
      .update(chats)
      .set({ updatedAt: new Date() })
      .where(eq(chats.id, chatId));

    return msg;
  },

  delete: async (userId: string, chatId: string) => {
    const [chat] = await db
      .select()
      .from(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
      .limit(1);
    if (!chat) throw new NotFoundError('Chat not found');
    await db.delete(messages).where(eq(messages.chatId, chatId));
    await db.delete(chats).where(eq(chats.id, chatId));
    return true;
  },

  updateTitle: async (chatId: string, title: string) => {
    await db.update(chats).set({ title }).where(eq(chats.id, chatId));
  },
};