# Storyflow — AI Story Board

A Jira-style story board where you can drag cards between columns, and
generate Agile user stories from a one-line feature idea using an AI
model that streams its response in live, token by token.

Built to demonstrate: modular React architecture, custom reusable hooks,
AI response streaming (SSE), real-time sync (Socket.io), portals, tabs,
and debouncing — without a heavy state library or a Kanban library doing
the interesting parts for you.

## Stack

- **Client:** React 18 + Vite, plain CSS, `socket.io-client`
- **Server:** Node.js + Express, `better-sqlite3`, `socket.io`, Groq API (`llama-3.3-70b-versatile`, streaming) via the OpenAI SDK, since Groq's API is OpenAI-compatible

## Project structure

```
server/
  db/               SQLite connection + schema + query functions
  routes/           REST endpoints (stories) and the SSE endpoint (ai)
  services/         Groq wrapper — the only file that knows about the AI provider
  socket/           Socket.io connection lifecycle
  index.js          wires it all together

client/src/
  api.js            fetch wrapper, one function per REST endpoint
  context/          BoardContext — single source of truth for story state
  hooks/            useDebounce, useSocket, useAIStream — reusable logic
  components/
    Board/          columns, cards, drag-and-drop, detail modal
    Backlog/         searchable list of unscheduled stories
    StoryGenerator/  the AI streaming panel
    Tabs/            custom accessible tab strip
    Modal/           portal-based modal
```

## Running it locally

**1. Server**

```bash
cd server
cp .env.example .env      # then paste your Groq key into .env as GROQ_API_KEY
npm install
npm run dev                # http://localhost:4000
```

**2. Client** (separate terminal)

```bash
cd client
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

Open `http://localhost:5173` in two browser tabs — moving a card in one
tab updates the other instantly, that's the Socket.io sync at work.

## How the moving pieces fit together (read this before an interview)

**Streaming AI responses.** The browser's built-in `EventSource` API can
only send GET requests, and we need to POST a prompt. So
`client/src/hooks/useAIStream.js` calls `fetch()` directly and reads
`response.body` as a stream, manually splitting it on the SSE
`event:`/`data:` format. On the server, `routes/ai.js` opens the HTTP
response and writes `event: token` / `data: {...}` chunks as Groq's
streaming API hands them over — see `services/openaiService.js`. Groq's
API is OpenAI-compatible, so it's still the `openai` npm package, just
pointed at Groq's base URL with a Groq key. Nothing is buffered on
either end; each token is pushed the moment it exists.

**Real-time board sync.** Every write to a story (`POST`, `PATCH`,
`DELETE` in `routes/stories.js`) does the DB write, *then* calls
`io.emit(...)` to broadcast the resulting story to every connected
client — including the one that made the change. `BoardContext.jsx`
listens for those events and applies them through a small reducer, so
there's exactly one code path for "a story entered/left/changed in
state," whether it came from your own action or someone else's.

**Debouncing**, used twice, same hook (`useDebounce.js`) both times:
- Backlog search: waits 300ms after you stop typing before hitting
  `GET /api/stories?search=...`, instead of firing a request per
  keystroke.
- Story description autosave: waits 700ms after you stop typing before
  `PATCH`-ing the description, so it doesn't save on every character.

**Portals.** `Modal.jsx` renders into a `div#modal-root` appended to
`document.body`, outside the React app's own DOM tree — via
`createPortal`. That matters because board columns are
`overflow: auto` for scrolling; a modal that stayed inside a column in
the DOM would get clipped by that overflow. It's still a normal React
child otherwise — context and state work exactly as if it weren't
portaled.

**Tabs.** `Tabs.jsx` is a from-scratch implementation with proper
`role="tablist"`/`role="tab"`/`role="tabpanel"` and arrow-key
navigation, rather than a UI library — small enough to be worth writing
by hand and understanding fully.

## Things you could extend (good talking points / next steps)

- Optimistic UI for drag-and-drop (currently waits for the server round-trip before the card visually settles into position)
- Auth + per-user boards instead of one shared board
- Reordering *within* a column (right now dropping always appends to the end)
- Swap `better-sqlite3` for Postgres if you want to deploy somewhere serverless
