import { Request, Response } from 'express';
import { chatService } from '../services/chat.service.js';
import { aiService } from '../services/ai.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BadRequestError } from '../utils/AppError.js';
import logger from '../logger/index.js';

export const chatController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const chats = await chatService.listByUser(userId);
    res.json({ success: true, data: chats });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { repositoryId, title } = req.body;
    const chat = await chatService.create(userId, repositoryId, title);
    res.status(201).json({ success: true, data: chat });
  }),

  getMessages: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    await chatService.getById(userId, id);
    const msgs = await chatService.getMessages(id);
    res.json({ success: true, data: msgs });
  }),

  sendMessage: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      throw new BadRequestError('Message content is required');
    }

    const chat = await chatService.getById(userId, id);

    await chatService.addMessage(id, 'user', content);

    const history = await chatService.getMessages(id);
    const aiMessages = history.map((m) => ({ role: m.role, content: m.content }));

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    let fullResponse = '';
    let citations: unknown[] = [];

    try {
      const repoId = chat.repositoryId || undefined;

      if (!repoId) {
        const words = "I don't have a repository context for this chat. Please create a chat with a repository selected.".split(' ');
        for (const word of words) {
          res.write(`data: ${JSON.stringify({ token: word + ' ' })}\n\n`);
          await new Promise((r) => setTimeout(r, 15));
        }
        fullResponse = words.join(' ');
        res.write(`data: ${JSON.stringify({ done: true, content: fullResponse, citations: [] })}\n\n`);
        res.end();
        await chatService.addMessage(id, 'assistant', fullResponse);
        return;
      }

      await aiService.streamChat(
        aiMessages,
        repoId,
        {
          onToken: (token) => {
            fullResponse += token;
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
          },
          onDone: (content) => {
            res.write(`data: ${JSON.stringify({ done: true, content, citations })}\n\n`);
            res.end();
          },
          onError: (err) => {
            logger.error('Stream error:', { error: err.message });
            res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
            res.end();
          },
        }
      );

      await chatService.addMessage(id, 'assistant', fullResponse, citations);
    } catch (err: any) {
      logger.error('Chat error:', { error: err.message });
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
      }
    }
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    await chatService.delete(userId, id);
    res.json({ success: true, data: { message: 'Chat deleted' } });
  }),
};