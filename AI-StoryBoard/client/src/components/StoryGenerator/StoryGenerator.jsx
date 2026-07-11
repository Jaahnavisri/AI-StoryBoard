import { useState } from 'react';
import { useAIStream } from '../../hooks/useAIStream.js';
import { useBoard } from '../../context/BoardContext.jsx';
import { parseStory } from './parseStory.js';
import './StoryGenerator.css';

export function StoryGenerator() {
  const [idea, setIdea] = useState('');
  const { text, isStreaming, error, generate, stop } = useAIStream();
  const { addStory } = useBoard();
  const [justAdded, setJustAdded] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!idea.trim() || isStreaming) return;
    setJustAdded(false);
    generate(idea);
  };

  const onAddToBacklog = async () => {
    const { title, description } = parseStory(text);
    await addStory({ title, description, status: 'backlog', priority: 'medium', aiGenerated: true });
    setJustAdded(true);
  };

  return (
    <div className="generator">
      <form onSubmit={onSubmit} className="generator-form">
        <label className="field-label" htmlFor="feature-idea">
          Describe a feature
        </label>
        <div className="generator-input-row">
          <input
            id="feature-idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g. let users export their board to CSV"
            disabled={isStreaming}
          />
          {isStreaming ? (
            <button type="button" className="ghost-btn" onClick={stop}>
              Stop
            </button>
          ) : (
            <button type="submit" className="primary-btn" disabled={!idea.trim()}>
              Generate
            </button>
          )}
        </div>
      </form>

      {(text || isStreaming) && (
        <div className="console">
          <pre>
            {text}
            {isStreaming && <span className="cursor" />}
          </pre>
        </div>
      )}

      {error && <p className="generator-error">{error}</p>}

      {text && !isStreaming && !error && (
        <button className="primary-btn" onClick={onAddToBacklog} disabled={justAdded}>
          {justAdded ? 'Added to backlog ✓' : 'Add to backlog'}
        </button>
      )}
    </div>
  );
}
