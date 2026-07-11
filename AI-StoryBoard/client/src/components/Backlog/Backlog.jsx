import { useEffect, useState } from 'react';
import { useBoard } from '../../context/BoardContext.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import './Backlog.css';

export function Backlog() {
  const { stories, refresh, moveStory } = useBoard();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  // Debounced server-side search: typing "auth login flow" fires one
  // request 300ms after the last keystroke, not five requests for
  // "a", "au", "aut"... The request goes to the backend rather than
  // filtering in-memory so this scales past "a few dozen stories"
  // sitting in the client.
  useEffect(() => {
    refresh(debouncedQuery || undefined);
  }, [debouncedQuery, refresh]);

  const backlogItems = stories.filter((s) => s.status === 'backlog');

  return (
    <div>
      <input
        type="search"
        placeholder="Search backlog…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="backlog-search"
      />

      <div className="backlog-list">
        {backlogItems.length === 0 && <p className="empty-hint">Nothing here yet — generate a story or add one manually.</p>}
        {backlogItems.map((story) => (
          <div key={story.id} className="backlog-row">
            <div>
              <p className="backlog-title">
                {story.title}
                {story.story_points != null && <span className="points-badge" style={{ marginLeft: 8 }}>{story.story_points} pts</span>}
              </p>
              <p className="backlog-desc">{story.description}</p>
            </div>
            <button className="ghost-btn" onClick={() => moveStory(story.id, 'todo', 0)}>
              Add to board →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
