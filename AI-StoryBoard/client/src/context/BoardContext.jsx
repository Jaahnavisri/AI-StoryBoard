import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { api } from '../api.js';
import { useSocket } from '../hooks/useSocket.js';

const BoardContext = createContext(null);

// A small reducer instead of five separate useState calls. The main win:
// the socket handlers and the local optimistic updates below all go
// through the same three actions, so there's one place that defines
// "what a story list update looks like" instead of it being scattered.
function boardReducer(state, action) {
  switch (action.type) {
    case 'SET_ALL':
      return action.stories;
    case 'UPSERT': {
      const exists = state.some((s) => s.id === action.story.id);
      return exists
        ? state.map((s) => (s.id === action.story.id ? action.story : s))
        : [...state, action.story];
    }
    case 'REMOVE':
      return state.filter((s) => s.id !== action.id);
    default:
      return state;
  }
}

export function BoardProvider({ children }) {
  const [stories, dispatch] = useReducer(boardReducer, []);
  const socket = useSocket();

  const refresh = useCallback(async (search) => {
    const data = await api.getStories(search);
    dispatch({ type: 'SET_ALL', stories: data });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Real-time sync: whenever ANY client (including this one) writes to
  // a story, the server broadcasts it back over the socket. Every
  // connected tab applies the same event, which is what keeps two
  // browser windows on the board in sync without polling.
  useEffect(() => {
    if (!socket) return;

    const onCreated = (story) => dispatch({ type: 'UPSERT', story });
    const onUpdated = (story) => dispatch({ type: 'UPSERT', story });
    const onDeleted = ({ id }) => dispatch({ type: 'REMOVE', id });

    socket.on('story:created', onCreated);
    socket.on('story:updated', onUpdated);
    socket.on('story:deleted', onDeleted);

    return () => {
      socket.off('story:created', onCreated);
      socket.off('story:updated', onUpdated);
      socket.off('story:deleted', onDeleted);
    };
  }, [socket]);

  const addStory = useCallback(async (story) => {
    // No optimistic update here on purpose -- the server assigns the id
    // and position, and the socket broadcast (which fires for the
    // creating tab too) is what actually adds it to state. Keeps there
    // from being two sources of truth for "how a story enters state".
    await api.createStory(story);
  }, []);

  const moveStory = useCallback(async (id, newStatus, newPosition) => {
    await api.updateStory(id, { status: newStatus, position: newPosition });
  }, []);

  const updateStoryFields = useCallback(async (id, changes) => {
    await api.updateStory(id, changes);
  }, []);

  const removeStory = useCallback(async (id) => {
    await api.deleteStory(id);
  }, []);

  const value = {
    stories,
    refresh,
    addStory,
    moveStory,
    updateStoryFields,
    removeStory,
    connectedClients: socket?.connectedClients ?? 1
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoard() {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoard must be used inside a BoardProvider');
  return ctx;
}
