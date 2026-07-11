import { useState } from 'react';
import { useBoard } from '../../context/BoardContext.jsx';
import './QuickAddForm.css';

// Lets you create a story directly in a column, no AI or backlog
// detour required. Kept as its own small component (rather than
// inlined in BoardColumn) since it owns its own form state and reset
// logic -- BoardColumn shouldn't need to know about any of that.
export function QuickAddForm({ status }) {
  const { addStory } = useBoard();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addStory({ title: title.trim(), status, priority: 'medium' });
      setTitle('');
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button className="quick-add-trigger" onClick={() => setIsOpen(true)}>
        + Add story
      </button>
    );
  }

  return (
    <form className="quick-add-form" onSubmit={onSubmit}>
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Story title…"
        onKeyDown={(e) => {
          if (e.key === 'Escape') setIsOpen(false);
        }}
      />
      <div className="quick-add-actions">
        <button type="submit" className="quick-add-confirm" disabled={!title.trim() || isSubmitting}>
          Add
        </button>
        <button type="button" className="quick-add-cancel" onClick={() => setIsOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
