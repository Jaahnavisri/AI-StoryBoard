import OpenAI from 'openai';

// Groq's API is OpenAI-compatible, so we still use the `openai` SDK --
// we just point it at Groq's base URL and pass a Groq API key instead.
// This is the only line that's provider-specific; swapping providers
// again later (back to OpenAI, or to something else) means changing
// baseURL/model here and nowhere else in the app.
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

const MODEL = 'openai/gpt-oss-20b';

const SYSTEM_PROMPT = `You write Agile user stories for a Jira-style board.
Given a short feature idea, respond with exactly this format and nothing else:

Title: <a short, punchy story title>
Description: <2-4 sentences in "As a ___, I want ___, so that ___" style>
Acceptance Criteria:
- <criterion 1>
- <criterion 2>
- <criterion 3>`;

/**
 * Streams a user story from Groq. Calls onToken(chunk) for every piece
 * of text as it arrives, and returns the full text once the stream ends.
 *
 * This is the only function that knows about the streaming response shape --
 * everything downstream (the route, the frontend) just sees "text chunks".
 */
export async function streamStory(featureIdea, onToken) {
  const stream = await client.chat.completions.create({
    model: MODEL,
    stream: true,
    temperature: 0.7,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: featureIdea }
    ]
  });

  let fullText = '';

  for await (const part of stream) {
    const token = part.choices[0]?.delta?.content;
    if (token) {
      fullText += token;
      onToken(token);
    }
  }

  return fullText;
}
