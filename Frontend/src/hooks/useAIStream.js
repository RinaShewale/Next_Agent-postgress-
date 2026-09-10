import { useState, useCallback } from 'react';
import { invokeAI } from '../api/aiInvoke';

export function useAIStream(sandboxID) {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || streaming) return;

    const userMsg = { role: 'user', content: text, id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);

    const aiMsgId = Date.now() + 1;
    setMessages((prev) => [...prev, { role: 'ai', content: '', id: aiMsgId }]);
    setStreaming(true);
    setError(null);

    await invokeAI({
      message: text,
      sandboxID,
      onChunk: (chunk) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId ? { ...m, content: m.content + chunk } : m
          )
        );
      },
      onDone: () => setStreaming(false),
      onError: (err) => {
        setError(err);
        setStreaming(false);
      },
    });
  }, [sandboxID, streaming]);

  const clearChat = () => setMessages([]);

  return { messages, streaming, error, sendMessage, clearChat };
}
