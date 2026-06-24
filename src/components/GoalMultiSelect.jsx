import { useEffect, useId, useRef, useState } from 'react';
import { formatGoalDateLabel } from '../lib/goalDateLabel';

export default function GoalMultiSelect({ goals, selectedIds, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listboxId = useId();

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selectedGoals = goals.filter((goal) => selectedIds.includes(goal.id));

  function toggleGoal(id) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((value) => value !== id));
      return;
    }
    onChange([...selectedIds, id]);
  }

  function clearAll() {
    onChange([]);
  }

  const triggerLabel =
    selectedGoals.length === 0
      ? 'Select goals…'
      : selectedGoals.length === 1
        ? selectedGoals[0].title
        : `${selectedGoals.length} goals selected`;

  return (
    <div className="goal-multiselect" ref={rootRef}>
      <button
        type="button"
        className={`goal-multiselect__trigger${open ? ' goal-multiselect__trigger--open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((value) => !value)}
      >
        <span
          className={
            selectedGoals.length === 0
              ? 'goal-multiselect__placeholder'
              : 'goal-multiselect__value'
          }
        >
          {triggerLabel}
        </span>
        <svg
          className="goal-multiselect__chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {selectedGoals.length > 0 && (
        <div className="goal-multiselect__chips">
          {selectedGoals.map((goal) => (
            <span key={goal.id} className="goal-multiselect__chip">
              {goal.title}
              <button
                type="button"
                className="goal-multiselect__chip-remove"
                aria-label={`Remove ${goal.title}`}
                onClick={() => toggleGoal(goal.id)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="goal-multiselect__panel" id={listboxId} role="listbox" aria-multiselectable="true">
          {goals.length === 0 ? (
            <p className="goal-multiselect__empty">No goals yet. Add some in Resources.</p>
          ) : (
            <>
              {selectedGoals.length > 0 && (
                <button
                  type="button"
                  className="goal-multiselect__clear"
                  onClick={clearAll}
                >
                  Clear selection
                </button>
              )}
              <ul className="goal-multiselect__list">
                {goals.map((goal) => {
                  const checked = selectedIds.includes(goal.id);
                  const dateLabel = formatGoalDateLabel(goal.date);

                  return (
                    <li key={goal.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={checked}
                        className={`goal-multiselect__option${checked ? ' goal-multiselect__option--selected' : ''}`}
                        onClick={() => toggleGoal(goal.id)}
                      >
                        <span
                          className={`goal-multiselect__checkbox${checked ? ' goal-multiselect__checkbox--checked' : ''}`}
                          aria-hidden="true"
                        >
                          {checked && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span className="goal-multiselect__option-text">{goal.title}</span>
                        {dateLabel && (
                          <span
                            className={`date-tag${
                              dateLabel === 'Today' || dateLabel === 'Yesterday'
                                ? ' date-tag--recent'
                                : ''
                            }`}
                          >
                            {dateLabel}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
