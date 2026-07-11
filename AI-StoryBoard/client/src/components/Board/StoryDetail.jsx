import { useEffect, useRef, useState } from 'react';
import { useBoard } from '../../context/BoardContext.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { PointsPicker } from './PointsPicker.jsx';

export function StoryDetail({ story, onClose }) {
  const { updateStoryFields, removeStory } = useBoard();
  const [description, setDescription] = useState(story.description);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved

  const debouncedDescription = useDebounce(description, 700);
  const isFirstRun = useRef(true);

  // Autosave: fires 700ms after the user stops typing, not on every
  // keystroke. Skipping the first render matters -- otherwise this
  // fires an unnecessary PATCH the instant the modal opens.
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    setSaveState('saving');
    updateStoryFields(story.id, { description: debouncedDescription }).then(() => {
      setSaveState('saved');
    });
  }, [debouncedDescription]); // eslint-disable-line react-hooks/exhaustive-deps

  // Points don't need debouncing -- a click is already a single,
  // deliberate action, unlike a stream of keystrokes. Save it the
  // moment it changes.
  const onPointsChange = (points) => {
    updateStoryFields(story.id, { story_points: points });
  };

  return (
    <div>
      <label className="field-label">Story points</label>
      <PointsPicker value={story.story_points} onChange={onPointsChange} />

      <label className="field-label" htmlFor="story-description" style={{ marginTop: 18, display: 'block' }}>
        Description
      </label>
      <textarea
        id="story-description"
        rows={6}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="story-textarea"
      />
      <div className="save-indicator">
        {saveState === 'saving' && 'Saving…'}
        {saveState === 'saved' && 'Saved'}
      </div>

      <div className="detail-actions">
        <button
          className="danger-btn"
          onClick={async () => {
            await removeStory(story.id);
            onClose();
          }}
        >
          Delete story
        </button>
      </div>
    </div>
  );
}
