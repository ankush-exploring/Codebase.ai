import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChatStream } from '../../hooks/useChatStream';

vi.mock('../../services/chatApi', () => ({
  chatApi: {
    getMessages: vi.fn().mockResolvedValue([]),
    sendMessage: vi.fn(async function* () {
      yield { token: 'Hello' };
      yield { token: ' world' };
      yield { done: true, content: 'Hello world', citations: [] };
    }),
  },
}));

describe('useChatStream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useChatStream('chat-1'));
    expect(result.current.messages).toEqual([]);
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toBe('');
  });

  it('loads messages from history', async () => {
    const { chatApi } = await import('../../services/chatApi');
    (chatApi.getMessages as any).mockResolvedValue([
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Hello' },
    ]);

    const { result } = renderHook(() => useChatStream('chat-1'));
    await act(async () => {
      await result.current.loadMessages();
    });
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]?.content).toBe('Hi');
  });

  it('appends user message and streams assistant', async () => {
    const { result } = renderHook(() => useChatStream('chat-1'));

    await act(async () => {
      await result.current.sendMessage('What is React?');
    });

    expect(result.current.messages.length).toBeGreaterThanOrEqual(2);
    expect(result.current.messages[0]?.role).toBe('user');
    expect(result.current.messages[0]?.content).toBe('What is React?');
    expect(result.current.messages[1]?.role).toBe('assistant');
  });

  it('does not send empty messages', async () => {
    const { result } = renderHook(() => useChatStream('chat-1'));
    await act(async () => {
      await result.current.sendMessage('   ');
    });
    expect(result.current.messages).toEqual([]);
  });
});
