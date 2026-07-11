import { useCallback, useRef, useState } from 'react';
import { API_BASE } from '../api.js';

/**
 * Streams text from POST /api/ai/generate-story.
 *
 * The browser's EventSource API is GET-only, so it can't send our prompt
 * in the request body. Instead we use fetch() directly and read the
 * response body as a stream, parsing the "event: x\ndata: y\n\n" chunks
 * ourselves. It's a bit more code than `new EventSource(url)`, but it's
 * the same wire protocol on the server side either way.
 */
export function useAIStream() {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const generate = useCallback(async (featureIdea) => {
    setText('');
    setError(null);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_BASE}/ai/generate-story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureIdea }),
        signal: controller.signal
      });

      if (!res.ok || !res.body) {
        throw new Error('Could not start generation stream');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by a blank line. Process every
        // complete event in the buffer, keep the trailing partial one.
        const events = buffer.split('\n\n');
        buffer = events.pop();

        for (const rawEvent of events) {
          const eventTypeLine = rawEvent.split('\n').find((l) => l.startsWith('event:'));
          const dataLine = rawEvent.split('\n').find((l) => l.startsWith('data:'));
          if (!dataLine) continue;

          const eventType = eventTypeLine?.replace('event:', '').trim() || 'message';
          const payload = JSON.parse(dataLine.replace('data:', '').trim());

          if (eventType === 'token') {
            setText((prev) => prev + payload.token);
          } else if (eventType === 'error') {
            setError(payload.message);
          }
          // 'done' event carries the full text too, but we've already
          // built it up token by token, so there's nothing left to do.
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { text, isStreaming, error, generate, stop };
}
