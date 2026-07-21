import { config } from '../config/index.js';
import { ragService, Citation } from './rag.service.js';
import logger from '../logger/index.js';

const SYSTEM_PROMPT = `You are an AI code assistant that helps developers understand their codebase.
You receive relevant code snippets as context (citations) and answer questions about the code.
Rules:
- Answer based ONLY on the provided context. If the context doesn't contain the answer, say so.
- When referencing code, mention the file path and line numbers from the citations.
- Use markdown formatting for code blocks with language tags.
- Be concise and helpful.
- If you're unsure, say "I don't have enough context to answer that."`;

function buildContextPrompt(citations: Citation[]): string {
  if (citations.length === 0) return 'No relevant code context found.';

  let context = 'Relevant code context:\n\n';
  citations.forEach((c, i) => {
    context += `[Citation ${i + 1}] ${c.filePath} (lines ${c.startLine}-${c.endLine}):\n\`\`\`\n${c.content}\n\`\`\`\n\n`;
  });
  return context;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: (fullResponse: string) => void;
  onError: (error: Error) => void;
}

let openaiClient: any = null;
let geminiModel: any = null;

async function getOpenAI() {
  if (!config.openai.apiKey && !config.openai.baseURL) return null;
  if (!openaiClient) {
    const { OpenAI } = await import('openai');
    openaiClient = new OpenAI({
      apiKey: config.openai.apiKey || 'ollama',
      baseURL: config.openai.baseURL || undefined,
    });
  }
  return openaiClient;
}

async function getGemini() {
  if (!config.gemini.apiKey) return null;
  if (!geminiModel) {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    geminiModel = genAI.getGenerativeModel({ model: config.gemini.model });
  }
  return geminiModel;
}

function generateMockResponse(query: string, citations: Citation[]): string {
  let response = `Based on the codebase, here's what I found:\n\n`;

  if (citations.length > 0) {
    response += `I found **${citations.length}** relevant code snippets:\n\n`;
    citations.slice(0, 3).forEach((c, i) => {
      response += `${i + 1}. **\`${c.filePath}\`** (lines ${c.startLine}-${c.endLine})\n`;
      const preview = c.content.split('\n').slice(0, 3).join('\n');
      response += `\`\`\`\n${preview}\n\`\`\`\n\n`;
    });
  } else {
    response += `I couldn't find specific code related to "${query}" in the indexed codebase. Try embedding the repository first if you haven't already.\n\n`;
  }

  response += `*Note: This is a simulated response. Connect an AI provider API key for real AI-powered answers.*`;
  return response;
}

function buildMessages(systemPrompt: string, messages: { role: string; content: string }[]) {
  return [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ];
}

export const aiService = {
  streamChat: async (
    messages: { role: string; content: string }[],
    repoId: string,
    callbacks: StreamCallbacks
  ): Promise<void> => {
    const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
    const query = lastUserMessage?.content || '';

    let citations: Citation[] = [];
    try {
      const ragResult = await ragService.query(repoId, query, 5);
      citations = ragResult.citations;
    } catch (err: any) {
      logger.warn('RAG query failed, proceeding without context', { error: err.message });
    }

    const contextPrompt = buildContextPrompt(citations);
    const fullSystemPrompt = SYSTEM_PROMPT + '\n\n' + contextPrompt;

    if (config.aiProvider === 'gemini') {
      const model = await getGemini();
      if (model) {
        try {
          const chat = model.startChat({
            systemInstruction: fullSystemPrompt,
            history: messages.slice(0, -1).map((m) => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.content }],
            })),
          });
          const result = await chat.sendMessageStream(lastUserMessage?.content || '');
          let fullResponse = '';
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              fullResponse += text;
              callbacks.onToken(text);
            }
          }
          callbacks.onDone(fullResponse);
          return;
        } catch (err: any) {
          logger.error('Gemini streaming error:', { error: err.message });
          callbacks.onError(err);
          return;
        }
      }
    }

    const client = await getOpenAI();

    if (!client) {
      const mockResponse = generateMockResponse(query, citations);
      const words = mockResponse.split(' ');
      for (const word of words) {
        callbacks.onToken(word + ' ');
        await new Promise((r) => setTimeout(r, 20));
      }
      callbacks.onDone(mockResponse);
      return;
    }

    const apiMessages = buildMessages(fullSystemPrompt, messages);

    try {
      const stream = await client.chat.completions.create({
        model: config.openai.model,
        messages: apiMessages,
        stream: true,
        max_tokens: 2048,
        temperature: 0.3,
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content || '';
        if (token) {
          fullResponse += token;
          callbacks.onToken(token);
        }
      }
      callbacks.onDone(fullResponse);
    } catch (err: any) {
      logger.error('AI streaming error:', { error: err.message });
      callbacks.onError(err);
    }
  },

  chat: async (
    messages: { role: string; content: string }[],
    repoId: string
  ): Promise<{ response: string; citations: Citation[] }> => {
    const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
    const query = lastUserMessage?.content || '';

    let citations: Citation[] = [];
    try {
      const ragResult = await ragService.query(repoId, query, 5);
      citations = ragResult.citations;
    } catch (err: any) {
      logger.warn('RAG query failed', { error: err.message });
    }

    const contextPrompt = buildContextPrompt(citations);
    const fullSystemPrompt = SYSTEM_PROMPT + '\n\n' + contextPrompt;

    if (config.aiProvider === 'gemini') {
      const model = await getGemini();
      if (model) {
        try {
          const chat = model.startChat({
            systemInstruction: fullSystemPrompt,
            history: messages.slice(0, -1).map((m) => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.content }],
            })),
          });
          const result = await chat.sendMessage(lastUserMessage?.content || '');
          const response = result.response.text();
          return { response, citations };
        } catch (err: any) {
          logger.error('Gemini error:', { error: err.message });
          return { response: 'Gemini API error: ' + err.message, citations };
        }
      }
    }

    const client = await getOpenAI();

    if (!client) {
      return { response: generateMockResponse(query, citations), citations };
    }

    const apiMessages = buildMessages(fullSystemPrompt, messages);

    try {
      const completion = await client.chat.completions.create({
        model: config.openai.model,
        messages: apiMessages,
        max_tokens: 2048,
        temperature: 0.3,
      });

      const response = completion.choices[0]?.message?.content || 'No response generated.';
      return { response, citations };
    } catch (err: any) {
      logger.error('AI chat error:', { error: err.message });
      return { response: 'AI error: ' + err.message, citations };
    }
  },
};
