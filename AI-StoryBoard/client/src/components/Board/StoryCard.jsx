import './StoryCard.css';

const PRIORITY_LABEL = { low: 'Low', medium: 'Med', high: 'High' };

export function StoryCard({ story, onClick }) {
  const onDragStart = (e) => {
    // Native HTML5 drag-and-drop, no library. All we need to pass along
    // is the story id -- the drop target looks it up from board state.
    e.dataTransfer.setData('text/plain', story.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="story-card"
      draggable
      onDragStart={onDragStart}
      onClick={() => onClick(story)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => e.key === 'Enter' && onClick(story)}
    >
      <div className="story-card-top">
        <span className="story-id">#{story.id.slice(0, 6)}</span>
        {story.ai_generated ? <span className="ai-badge">AI</span> : null}
      </div>
      <p className="story-title">{story.title}</p>
      <div className="story-card-bottom">
        <span className={`priority-chip priority-${story.priority}`}>{PRIORITY_LABEL[story.priority]}</span>
        {story.story_points != null && <span className="points-badge">{story.story_points} pts</span>}
      </div>
    </div>
  );
}
