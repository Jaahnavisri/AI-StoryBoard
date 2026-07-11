import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

// Rendered into a dedicated DOM node instead of the React root. This
// matters mainly for stacking/overflow: the board columns use
// overflow: auto for scrolling, and a modal that's a normal descendant
// of a column would get clipped by that overflow. A portal escapes that
// entirely while still behaving like a normal React child (context,
// event bubbling through React's synthetic event system, etc. all work).
let portalRoot = document.getElementById('modal-root');
if (!portalRoot) {
  portalRoot = document.createElement('div');
  portalRoot.id = 'modal-root';
  document.body.appendChild(portalRoot);
}

export function Modal({ title, onClose, children }) {
  // Close on Escape -- easy to forget, expected by anyone used to real apps
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    portalRoot
  );
}
