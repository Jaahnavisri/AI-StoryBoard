// Everything DB-related lives in this one file on purpose.
// For a project this size, splitting "db connection" and "schema" and
// "migrations" into five files is overkill -- one file you can read
// top to bottom is more useful than a folder of ceremony.

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'storyboard.sqlite');

export const db = new Database(dbPath);

// WAL mode = readers don't block writers. Doesn't matter much for a
// single-user demo, but it's a one-liner and it's the "correct" setting
// for an app that also has a socket connection writing in the background.
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS stories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'backlog', -- backlog | todo | in_progress | review | done
    priority TEXT NOT NULL DEFAULT 'medium', -- low | medium | high
    story_points INTEGER DEFAULT NULL, -- Fibonacci-ish: 1,2,3,5,8,13,21, or unset
    position INTEGER NOT NULL DEFAULT 0,
    ai_generated INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

// CREATE TABLE IF NOT EXISTS only helps on a fresh DB file -- anyone
// (including past-you) who already ran this app before story_points
// existed has a stories.sqlite on disk without the column. This checks
// for it and adds it in place rather than requiring a full DB wipe.
const existingColumns = db.prepare('PRAGMA table_info(stories)').all();
const hasStoryPoints = existingColumns.some((col) => col.name === 'story_points');
if (!hasStoryPoints) {
  db.exec('ALTER TABLE stories ADD COLUMN story_points INTEGER DEFAULT NULL');
  console.log('[db] migrated: added story_points column');
}

console.log(`[db] connected -> ${dbPath}`);
