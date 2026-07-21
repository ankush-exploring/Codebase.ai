interface Chunk {
  content: string;
  startLine: number;
  endLine: number;
  tokens: number;
}

const LINES_PER_CHUNK = 500;

export function chunkContent(content: string): Chunk[] {
  const lines = content.split('\n');
  if (lines.length <= LINES_PER_CHUNK) {
    return [{
      content,
      startLine: 1,
      endLine: lines.length,
      tokens: estimateTokens(content),
    }];
  }

  const chunks: Chunk[] = [];
  for (let i = 0; i < lines.length; i += LINES_PER_CHUNK) {
    const chunkLines = lines.slice(i, i + LINES_PER_CHUNK);
    const chunkContent = chunkLines.join('\n');
    chunks.push({
      content: chunkContent,
      startLine: i + 1,
      endLine: Math.min(i + LINES_PER_CHUNK, lines.length),
      tokens: estimateTokens(chunkContent),
    });
  }
  return chunks;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}