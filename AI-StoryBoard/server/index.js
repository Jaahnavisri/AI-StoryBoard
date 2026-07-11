import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import './db/index.js'; // side-effect: opens the DB connection + creates table
import { storiesRouter } from './routes/stories.js';
import { aiRouter } from './routes/ai.js';
import { registerBoardSocket } from './socket/boardSocket.js';

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: CLIENT_URL }
});

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/stories', storiesRouter(io));
app.use('/api/ai', aiRouter);

registerBoardSocket(io);

httpServer.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
