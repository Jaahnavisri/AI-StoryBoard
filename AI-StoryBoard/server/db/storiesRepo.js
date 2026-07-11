// Repository pattern, kept deliberately thin: routes never write raw SQL,
// they call these functions. Makes it easy to swap SQLite for something
// else later without touching route logic.

import { randomUUID } from 'crypto';
import { db } from './index.js';

const nowISO = () => new Date().toISOString();

export function getAllStories() {
  return db.prepare('SELECT * FROM stories ORDER BY status, position ASC').all();
}

export function searchStories(query) {
  const like = `%${query}%`;
  return db
    .prepare(
      `SELECT * FROM stories
       WHERE title LIKE ? OR description LIKE ?
       ORDER BY updated_at DESC`
    )
    .all(like, like);
}

export function getStoryById(id) {
  return db.prepare('SELECT * FROM stories WHERE id = ?').get(id);
}

export function createStory({
  title,
  description = '',
  status = 'backlog',
  priority = 'medium',
  storyPoints = null,
  aiGenerated = false
}) {
  const id = randomUUID();
  const timestamp = nowISO();

  // New card goes to the bottom of its column.
  const { maxPos } = db
    .prepare('SELECT COALESCE(MAX(position), -1) as maxPos FROM stories WHERE status = ?')
    .get(status);

  db.prepare(
    `INSERT INTO stories (id, title, description, status, priority, story_points, position, ai_generated, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, title, description, status, priority, storyPoints, maxPos + 1, aiGenerated ? 1 : 0, timestamp, timestamp);

  return getStoryById(id);
}

export function updateStory(id, changes) {
  const existing = getStoryById(id);
  if (!existing) return null;

  const merged = { ...existing, ...changes, updated_at: nowISO() };

  db.prepare(
    `UPDATE stories
     SET title = ?, description = ?, status = ?, priority = ?, story_points = ?, position = ?, updated_at = ?
     WHERE id = ?`
  ).run(
    merged.title,
    merged.description,
    merged.status,
    merged.priority,
    merged.story_points,
    merged.position,
    merged.updated_at,
    id
  );

  return getStoryById(id);
}

export function deleteStory(id) {
  const result = db.prepare('DELETE FROM stories WHERE id = ?').run(id);
  return result.changes > 0;
}
