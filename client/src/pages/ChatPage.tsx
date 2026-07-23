import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { chatApi, Chat } from '../services/chatApi';
import { repositoryApi, Repository } from '../services/repositoryApi';
import { useChatStream } from '../hooks/useChatStream';
import ChatMessage from '../components/chat/ChatMessage';
import { Spinner } from '../components/ui';

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const [chatId, setChatId] = useState<string | null>(id || null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [input, setInput] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isStreaming, error, sendMessage, loadMessages } = useChatStream(chatId || '');

  useEffect(() => {
    chatApi.list().then(setChats).catch(() => {}).finally(() => setLoadingChats(false));
    repositoryApi.list().then(setRepos).catch(() => {});
  }, []);

  useEffect(() => {
    if (chatId) loadMessages();
  }, [chatId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewChat = useCallback(async () => {
    try {
      const chat = await chatApi.create(selectedRepo || undefined, 'New Chat');
      setChats((prev) => [chat, ...prev]);
      setChatId(chat.id);
    } catch {
      /* silently fail */
    }
  }, [selectedRepo]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        handleNewChat();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleNewChat]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || !chatId) return;
    const msg = input;
    setInput('');
    await sendMessage(msg);
  };

  const handleDeleteChat = async (chatIdToDelete: string) => {
    if (!confirm('Delete this chat?')) return;
    try {
      await chatApi.delete(chatIdToDelete);
      setChats((prev) => prev.filter((c) => c.id !== chatIdToDelete));
      if (chatId === chatIdToDelete) setChatId(null);
    } catch {
      /* silently fail */
    }
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] -m-6">
      <div className="w-56 bg-clay-surface dark:bg-[#252526] border-r border-clay dark:border-[#3c3c3c] flex flex-col">
        <div className="p-3 border-b border-clay dark:border-[#3c3c3c]">
          <div className="mt-1">
            <select
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="w-full px-3 py-1.5 clay-input rounded-lg text-xs text-clay dark:text-[#cccccc] focus:outline-none focus:border-[#007acc] transition-colors"
            >
              <option value="">No repository</option>
              {repos.filter((r) => r.status === 'parsed' || r.status === 'ready' || r.status === 'embedded').map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleNewChat}
            className="w-full mt-2 px-3 py-1.5 bg-[#007acc] text-white text-xs rounded-lg hover:bg-[#006bb3] transition-all flex items-center justify-between shadow-clay-sm font-medium"
          >
            <span>+ New Chat</span>
            <kbd className="text-[10px] text-white/60 bg-white/10 px-1 py-0.5 rounded font-mono">Ctrl+L</kbd>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {loadingChats ? (
            <div className="flex justify-center py-4"><Spinner size="sm" /></div>
          ) : chats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-clay-muted dark:text-[#666666] text-xs">No chats yet</p>
              <p className="text-clay-muted dark:text-[#666666] text-[10px] mt-1">Start a new conversation</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs transition-all ${
                  chatId === chat.id
                    ? 'bg-[#007acc]/10 text-[#007acc] dark:text-[#007acc]'
                    : 'text-clay-secondary dark:text-[#969696] hover:bg-clay-elevated dark:hover:bg-[#2a2d2e] hover:text-clay dark:hover:text-[#cccccc]'
                }`}
                onClick={() => setChatId(chat.id)}
              >
                <svg className="w-3 h-3 flex-shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="truncate flex-1">{chat.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.id); }}
                  className="opacity-0 group-hover:opacity-100 text-clay-muted dark:text-[#666666] hover:text-red-500 transition-all text-xs"
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {!chatId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-br from-[#007acc]/10 to-[#4fc3f7]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#007acc]/20 shadow-clay-sm">
                <svg className="w-8 h-8 text-[#007acc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M9 18l-6-6 6-6" />
                  <path d="M15 6l6 6-6 6" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-clay dark:text-[#cccccc] mb-1">
                codebase<span className="gradient-text">.ai</span>
              </h2>
              <p className="text-sm text-clay-secondary dark:text-[#969696] mb-5 max-w-xs mx-auto">
                Select a repository and start a new chat to ask questions about your code.
              </p>
              <button
                onClick={handleNewChat}
                className="px-5 py-2 bg-[#007acc] text-white rounded-lg hover:bg-[#006bb3] transition-all text-sm font-medium shadow-clay-sm"
              >
                Start New Chat
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              {messages.length === 0 && (
                <div className="text-center py-12 animate-fade-in">
                  <div className="w-10 h-10 bg-[#007acc]/10 rounded-lg flex items-center justify-center mx-auto mb-3 border border-[#007acc]/10">
                    <svg className="w-5 h-5 text-[#007acc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-clay-secondary dark:text-[#969696] text-sm mb-4">Ask a question about your codebase...</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Explain the auth flow', 'Find performance bottlenecks', 'How does the API work?'].map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); inputRef.current?.focus(); }}
                        className="px-3 py-1 text-xs text-clay-secondary dark:text-[#969696] bg-clay-surface dark:bg-[#2a2d2e] border border-clay dark:border-[#3c3c3c] rounded-lg hover:border-[#007acc] hover:text-[#007acc] transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  message={msg}
                  isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {error && (
              <div className="mx-4 mb-2 px-4 py-2 text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSend} className="p-4 border-t border-clay dark:border-[#3c3c3c]">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about the codebase... (Ctrl+K)"
                  className="flex-1 px-4 py-2 clay-input rounded-lg placeholder-clay-muted dark:placeholder-[#666666] focus:outline-none focus:border-[#007acc] transition-all text-sm"
                  disabled={isStreaming}
                />
                <button
                  type="submit"
                  disabled={isStreaming || !input.trim()}
                  className="px-4 py-2 bg-[#007acc] text-white rounded-lg hover:bg-[#006bb3] transition-all disabled:opacity-40 text-sm font-medium shadow-clay-sm"
                >
                  {isStreaming ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : 'Send'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
