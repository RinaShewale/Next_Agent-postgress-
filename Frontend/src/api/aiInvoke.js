const BASE_URL = '/api';

/**
 * POST /api/ai/invoke
 * Handles SSE streaming from the AI.
 */
export async function invokeAI({ message, sandboxID, onChunk, onDone, onError }) {
  try {
    const response = await fetch(`${BASE_URL}/ai/invoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // FIX #1: backend expects "projectId", not "sandboxID"
      body: JSON.stringify({ message, projectId: sandboxID }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`AI Request failed (${response.status}): ${errText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    // FIX #2: track the current SSE "event:" type so we don't
    // treat "event: end" / "event: error" lines as chat content.
    let currentEvent = 'message';

    const processLine = (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('event:')) {
        currentEvent = trimmed.slice(6).trim();
        return;
      }

      if (!trimmed.startsWith('data:')) {
        // Unknown line type (not data, not event) — ignore instead of forwarding.
        return;
      }

      const cleanedLine = trimmed.slice(5).trim();

      if (currentEvent === 'end' || cleanedLine === '[DONE]') {
        onDone?.();
        return true; // signal done
      }

      if (currentEvent === 'error') {
        try {
          const parsed = JSON.parse(cleanedLine);
          onError?.(parsed.message || cleanedLine);
        } catch {
          onError?.(cleanedLine);
        }
        return true;
      }

      try {
        const parsed = JSON.parse(cleanedLine);

        if (parsed.error) {
          onError?.(parsed.error);
          return;
        }

        // Backend sends { message: "..." } for text chunks
        if (typeof parsed.message === 'string' && parsed.message) {
          onChunk(parsed.message);
        } else if (typeof parsed === 'string') {
          onChunk(parsed);
        }
      } catch {
        // Not JSON — forward as raw text if non-empty
        if (cleanedLine) onChunk(cleanedLine);
      }

      // reset event type after a data line, per SSE convention
      currentEvent = 'message';
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const isDone = processLine(line);
        if (isDone) return;
      }
    }

    // Flush any remaining buffer
    if (buffer.trim()) {
      processLine(buffer.trim());
    }

    onDone?.();
  } catch (err) {
    console.error('[AI] Stream Error:', err);
    onError?.(err.message || 'Stream connection error');
  }
}