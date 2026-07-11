import { Router } from 'express';
import { streamStory } from '../services/openaiService.js';

export const aiRouter = Router();

// Why POST + manual SSE instead of the browser's EventSource API:
// EventSource only supports GET requests, and we need to send a prompt
// in the body. So the client uses fetch() + a ReadableStream reader
// instead (see client/src/hooks/useAIStream.js). The wire format is
// still plain SSE ("data: ...\n\n"), we just don't use the built-in
// EventSource object to consume it.
aiRouter.post('/generate-story', async (req, res) => {
  const { featureIdea } = req.body;

  if (!featureIdea || !featureIdea.trim()) {
    return res.status(400).json({ error: 'featureIdea is required' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const fullText = await streamStory(featureIdea, (token) => {
      sendEvent('token', { token });
    });

    sendEvent('done', { fullText });
  } catch (err) {
    console.error('[ai] generation failed:', err.message);
    sendEvent('error', { message: `Story generation failed: ${err.message}` });
  } finally {
    res.end();
  }
});
