import { useState } from 'react';
import { StoryCard } from './StoryCard.jsx';
import { QuickAddForm } from './QuickAddForm.jsx';
import './BoardColumn.css';

export function BoardColumn({ status, label, stories, onDropStory, onCardClick }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const onDragOver = (e) => {
    e.preventDefault(); // required, or onDrop never fires
    setIsDragOver(true);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const storyId = e.dataTransfer.getData('text/plain');
    // New position = end of this column, simplest reordering rule that
    // still gives sensible ordering without a full sort-and-reindex.
    onDropStory(storyId, status, stories.length);
  };

  const totalPoints = stories.reduce((sum, s) => sum + (s.story_points || 0), 0);

  return (
    <div
      className={`board-column ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={onDrop}
    >
      <div className="board-column-header">
        <span className={`status-dot status-${status}`} />
        <h3>{label}</h3>
        {totalPoints > 0 && <span className="points-total">{totalPoints} pts</span>}
        <span className="count">{stories.length}</span>
      </div>
      <div className="board-column-body">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} onClick={onCardClick} />
        ))}
        {stories.length === 0 && <p className="empty-hint">Drop a story here</p>}
        <QuickAddForm status={status} />
      </div>
    </div>
  );
}
