import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function CharacterMultiSelect({
  characters,
  selectedIds,
  onChange,
  emptyLabel = 'Select characters…',
}) {
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

  const selectedCharacters = characters.filter((character) =>
    selectedIds.includes(character.id)
  );
  const allSelected =
    characters.length > 0 && selectedCharacters.length === characters.length;

  function toggleCharacter(id) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((value) => value !== id));
      return;
    }
    onChange([...selectedIds, id]);
  }

  function selectAll() {
    onChange(characters.map((character) => character.id));
  }

  function clearAll() {
    onChange([]);
  }

  const triggerLabel =
    selectedCharacters.length === 0
      ? emptyLabel
      : allSelected
        ? 'All characters'
        : selectedCharacters.length === 1
          ? selectedCharacters[0].name
          : `${selectedCharacters.length} characters selected`;

  return (
    <div className="goal-multiselect" ref={rootRef}>
      <Button
        type="button"
        variant="outline"
        className={cn(
          'h-auto min-h-8 w-full justify-between px-2.5 py-2 font-normal',
          open && 'ring-3 ring-ring/50'
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={selectedCharacters.length === 0 ? 'text-muted-foreground' : undefined}>
          {triggerLabel}
        </span>
        <ChevronDown
          className={cn(
            'size-4 text-muted-foreground transition-transform',
            open && 'rotate-180'
          )}
        />
      </Button>

      {selectedCharacters.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedCharacters.map((character) => (
            <Badge key={character.id} variant="secondary" className="gap-1 pr-1">
              {character.name}
              <button
                type="button"
                className="inline-flex size-4 items-center justify-center rounded-full hover:bg-muted"
                aria-label={`Remove ${character.name}`}
                onClick={() => toggleCharacter(character.id)}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {open && (
        <div
          className="goal-multiselect__panel"
          id={listboxId}
          role="listbox"
          aria-multiselectable="true"
        >
          {characters.length === 0 ? (
            <p className="px-2 py-3 text-center text-sm text-muted-foreground">
              No characters yet. Add some in Resources.
            </p>
          ) : (
            <>
              <div className="mb-1 flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start"
                  onClick={selectAll}
                >
                  Select all
                </Button>
                {selectedCharacters.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="flex-1 justify-start"
                    onClick={clearAll}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <ul className="m-0 list-none p-0">
                {characters.map((character) => {
                  const checked = selectedIds.includes(character.id);

                  return (
                    <li key={character.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={checked}
                        className={cn(
                          'goal-multiselect__option',
                          checked && 'goal-multiselect__option--selected'
                        )}
                        onClick={() => toggleCharacter(character.id)}
                      >
                        <span
                          className={cn(
                            'goal-multiselect__checkbox',
                            checked && 'goal-multiselect__checkbox--checked'
                          )}
                          aria-hidden="true"
                        >
                          {checked && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{character.name}</span>
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
