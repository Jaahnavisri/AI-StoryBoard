import { useState } from 'react';
import './Tabs.css';

/**
 * A small, self-contained tabs implementation. Didn't reach for a
 * library here since a tab strip is only ~30 lines and it's a good
 * excuse to show ARIA roles + keyboard nav done by hand.
 *
 * Usage:
 *   <Tabs tabs={[{ id: 'board', label: 'Board' }, ...]}>
 *     {(activeId) => activeId === 'board' ? <Board /> : <Backlog />}
 *   </Tabs>
 */
export function Tabs({ tabs, initialId, children }) {
  const [activeId, setActiveId] = useState(initialId || tabs[0]?.id);

  const onKeyDown = (e) => {
    const currentIndex = tabs.findIndex((t) => t.id === activeId);
    if (e.key === 'ArrowRight') {
      setActiveId(tabs[(currentIndex + 1) % tabs.length].id);
    } else if (e.key === 'ArrowLeft') {
      setActiveId(tabs[(currentIndex - 1 + tabs.length) % tabs.length].id);
    }
  };

  return (
    <div>
      <div className="tab-list" role="tablist" onKeyDown={onKeyDown}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeId === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeId === tab.id ? 0 : -1}
            className={`tab-trigger ${activeId === tab.id ? 'active' : ''}`}
            onClick={() => setActiveId(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className="tab-panel"
        role="tabpanel"
        id={`panel-${activeId}`}
        aria-labelledby={`tab-${activeId}`}
      >
        {children(activeId)}
      </div>
    </div>
  );
}
