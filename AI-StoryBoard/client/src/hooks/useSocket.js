import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE } from '../api.js';

const SOCKET_URL = API_BASE.replace(/\/api\/?$/, '');

/**
 * Opens a single socket connection for the app's lifetime and returns it,
 * plus how many browser tabs/clients are currently connected (handy for
 * showing "2 people online" on the board without building real auth).
 *
 * Returning the raw socket (rather than wrapping every event in its own
 * hook) keeps this reusable -- BoardContext listens for story events,
 * but nothing stops another part of the app from using the same
 * connection for something unrelated later.
 */
export function useSocket() {
  const socketRef = useRef(null);
  const [connectedClients, setConnectedClients] = useState(1);
  const [, forceRender] = useState(0);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;
    forceRender((n) => n + 1); // socket is ready, let consumers re-render

    socket.on('presence:count', setConnectedClients);

    return () => {
      socket.disconnect();
    };
  }, []);

  const socket = socketRef.current;
  if (socket) socket.connectedClients = connectedClients;
  return socket;
}
