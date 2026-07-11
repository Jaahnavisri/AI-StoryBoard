import { Router } from 'express';
import {
  getAllStories,
  searchStories,
  createStory,
  updateStory,
  deleteStory
} from '../db/storiesRepo.js';

// I'm passing `io` in from index.js instead of importing a singleton
// socket instance. Keeps this file testable without spinning up a
// real socket server, and makes the dependency obvious at a glance.
export function storiesRouter(io) {
  const router = Router();

  router.get('/', (req, res) => {
    const { search } = req.query;
    const stories = search ? searchStories(search) : getAllStories();
    res.json(stories);
  });

  router.post('/', (req, res) => {
    const { title, description, status, priority, storyPoints, aiGenerated } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const story = createStory({ title, description, status, priority, storyPoints, aiGenerated });
    io.emit('story:created', story);
    res.status(201).json(story);
  });

  // Used for everything from "edit description" to "drag card to new column".
  // Same endpoint, different fields in the body -- the client just sends
  // whatever changed.
  router.patch('/:id', (req, res) => {
    const story = updateStory(req.params.id, req.body);

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    io.emit('story:updated', story);
    res.json(story);
  });

  router.delete('/:id', (req, res) => {
    const deleted = deleteStory(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Story not found' });
    }

    io.emit('story:deleted', { id: req.params.id });
    res.status(204).end();
  });

  return router;
}
