import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
      <Button
        type="button"
        variant="outline"
        className={cn('h-auto min-h-8 w-full justify-between px-2.5 py-2 font-normal', open && 'ring-3 ring-ring/50')}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={selectedGoals.length === 0 ? 'text-muted-foreground' : undefined}>
          {triggerLabel}
        </span>
        <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </Button>

      {selectedGoals.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedGoals.map((goal) => (
            <Badge key={goal.id} variant="secondary" className="gap-1 pr-1">
              {goal.title}
              <button
                type="button"
                className="inline-flex size-4 items-center justify-center rounded-full hover:bg-muted"
                aria-label={`Remove ${goal.title}`}
                onClick={() => toggleGoal(goal.id)}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {open && (
        <div className="goal-multiselect__panel" id={listboxId} role="listbox" aria-multiselectable="true">
          {goals.length === 0 ? (
            <p className="px-2 py-3 text-center text-sm text-muted-foreground">
              No goals yet. Add some in Resources.
            </p>
          ) : (
            <>
              {selectedGoals.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mb-1 w-full justify-start"
                  onClick={clearAll}
                >
                  Clear selection
                </Button>
              )}
              <ul className="m-0 list-none p-0">
                {goals.map((goal) => {
                  const checked = selectedIds.includes(goal.id);
                  const dateLabel = formatGoalDateLabel(goal.date);

                  return (
                    <li key={goal.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={checked}
                        className={cn('goal-multiselect__option', checked && 'goal-multiselect__option--selected')}
                        onClick={() => toggleGoal(goal.id)}
                      >
                        <span
                          className={cn('goal-multiselect__checkbox', checked && 'goal-multiselect__checkbox--checked')}
                          aria-hidden="true"
                        >
                          {checked && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{goal.title}</span>
                        {dateLabel && (
                          <span
                            className={cn(
                              'date-tag',
                              (dateLabel === 'Today' || dateLabel === 'Yesterday') && 'date-tag--recent'
                            )}
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
