import { useEffect } from 'react';

export default function ScreensCopyModal({ row, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const title = row.goalName.trim() || row.hook.trim() || 'Plan screens';

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="modal-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="screens-modal-title"
      >
        <header className="modal-panel__header">
          <div>
            <h3 id="screens-modal-title">Screens with Copy</h3>
            <p className="modal-panel__subtitle">{title}</p>
          </div>
          <button
            type="button"
            className="modal-panel__close"
            onClick={onClose}
          >
            Close
          </button>
        </header>
        <div className="modal-panel__body">
          {row.screens.length === 0 ? (
            <p className="modal-empty">No screens in this plan.</p>
          ) : (
            <ol className="screen-read-list">
              {row.screens.map((screen, index) => (
                <li key={index} className="screen-read-item">
                  <p className="screen-read-item__name">
                    {screen.name.trim() || `Screen ${index + 1}`}
                  </p>
                  <p className="screen-read-item__copy">
                    {screen.copy.trim() || '—'}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
