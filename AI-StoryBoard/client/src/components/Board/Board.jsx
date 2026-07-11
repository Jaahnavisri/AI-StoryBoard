import { useMemo, useState } from 'react';
import { useBoard } from '../../context/BoardContext.jsx';
import { BoardColumn } from './BoardColumn.jsx';
import { Modal } from '../Modal/Modal.jsx';
import { StoryDetail } from './StoryDetail.jsx';
import './Board.css';

const COLUMNS = [
  { status: 'todo', label: 'To Do' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'review', label: 'Review' },
  { status: 'done', label: 'Done' }
];

export function Board() {
  const { stories, moveStory } = useBoard();
  const [activeStoryId, setActiveStoryId] = useState(null);

  // Grouping recomputes only when the story list actually changes,
  // not on every render of the board (e.g. when a modal opens/closes).
  const grouped = useMemo(() => {
    const map = Object.fromEntries(COLUMNS.map((c) => [c.status, []]));
    for (const story of stories) {
      if (map[story.status]) map[story.status].push(story);
    }
    for (const list of Object.values(map)) {
      list.sort((a, b) => a.position - b.position);
    }
    return map;
  }, [stories]);

  // Deriving the open story from live state (instead of storing the
  // whole object when the card was clicked) means the modal reflects
  // real-time updates -- your own edits, or another tab's -- while
  // it's open, rather than showing a snapshot from the moment it opened.
  const activeStory = stories.find((s) => s.id === activeStoryId) || null;

  return (
    <>
      <div className="board-columns">
        {COLUMNS.map((col) => (
          <BoardColumn
            key={col.status}
            status={col.status}
            label={col.label}
            stories={grouped[col.status]}
            onDropStory={moveStory}
            onCardClick={(story) => setActiveStoryId(story.id)}
          />
        ))}
      </div>

      {activeStory && (
        <Modal title={activeStory.title} onClose={() => setActiveStoryId(null)}>
          <StoryDetail story={activeStory} onClose={() => setActiveStoryId(null)} />
        </Modal>
      )}
    </>
  );
}
