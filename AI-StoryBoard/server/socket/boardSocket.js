// The routes (stories.js) are what actually emit board events like
// 'story:created' -- they have access to `io` directly since that's
// where the data changes. This file just handles the connection
// lifecycle itself (logging, presence count). Splitting it this way
// means "what happens on connect" and "what happens on data change"
// don't get tangled together.

export function registerBoardSocket(io) {
  let connectedClients = 0;

  io.on('connection', (socket) => {
    connectedClients += 1;
    io.emit('presence:count', connectedClients);
    console.log(`[socket] client connected (${socket.id}) -- ${connectedClients} online`);

    socket.on('disconnect', () => {
      connectedClients -= 1;
      io.emit('presence:count', connectedClients);
      console.log(`[socket] client disconnected (${socket.id}) -- ${connectedClients} online`);
    });
  });
}
