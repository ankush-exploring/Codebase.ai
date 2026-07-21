import { useState, useCallback, useRef } from 'react';
import { chatApi } from '../services/chatApi';

export interface StreamMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: unknown[];
}

export function useChatStream(chatId: string) {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef(false);

  const loadMessages = useCallback(async () => {
    if (!chatId) return;
    try {
      const history = await chatApi.getMessages(chatId);
      setMessages(
        history.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
          citations: m.citations,
        }))
      );
    } catch {
      /* silently fail */
    }
  }, [chatId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!chatId || !content.trim() || isStreaming) return;

      setError('');
      abortRef.current = false;

      const userMsg: StreamMessage = { role: 'user', content };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);

      const assistantMsg: StreamMessage = { role: 'assistant', content: '' };
      setMessages((prev) => [...prev, assistantMsg]);

      try {
        for await (const chunk of chatApi.sendMessage(chatId, content)) {
          if (abortRef.current) break;

          if (chunk.error) {
            setError(chunk.error);
            break;
          }

          if (chunk.token) {
            setMessages((prev) => {
              const updated = [...prev];
              const lastIdx = updated.length - 1;
              const last = updated[lastIdx];
              if (last && last.role === 'assistant') {
                updated[lastIdx] = { ...last, content: last.content + chunk.token };
              }
              return updated;
            });
          }

          if (chunk.done) {
            setMessages((prev) => {
              const updated = [...prev];
              const lastIdx = updated.length - 1;
              const last = updated[lastIdx];
              if (last && last.role === 'assistant') {
                updated[lastIdx] = {
                  ...last,
                  content: chunk.content as string,
                  citations: chunk.citations as unknown[],
                };
              }
              return updated;
            });
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to send message');
      } finally {
        setIsStreaming(false);
      }
    },
    [chatId, isStreaming]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current = true;
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, error, sendMessage, stopStreaming, loadMessages };
}