import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DataStatus from '../components/DataStatus';
import CopyTextButton from '../components/CopyTextButton';
import ScreensCopyModal from '../components/ScreensCopyModal';
import PageHeader from '@/components/layout/PageHeader';
import { AddRowButton } from '@/components/table/TableActions';
import { Button } from '@/components/ui/button';
import { usePlan } from '../hooks/usePlan';
import { useCharacters } from '../hooks/useCharacters';
import { formatPlanSerial, sortPlansByRecent } from '../lib/planSort';
import { normalizeExternalUrl } from '../lib/externalUrl';

import { screenSequenceButtonLabel } from '../lib/planDisplay';
import { PLAN_STATUSES } from '../lib/planStatus';

function SheetCell({
  value,
  onChange,
  onBlur,
  ariaLabel,
  placeholder,
  minRows = 1,
  className = '',
}) {
  const ref = useRef(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = '0';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useLayoutEffect(() => {
    resize();
  }, [value, resize]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const observer = new ResizeObserver(() => {
      resize();
    });
    observer.observe(el);
    if (el.parentElement) {
      observer.observe(el.parentElement);
    }

    return () => observer.disconnect();
  }, [resize]);

  return (
    <textarea
      ref={ref}
      className={`cell-input cell-input--sheet ${className}`.trim()}
      value={value}
      placeholder={placeholder}
      rows={minRows}
      onChange={(e) => {
        onChange(e.target.value);
        requestAnimationFrame(resize);
      }}
      onBlur={onBlur}
      aria-label={ariaLabel}
    />
  );
}

function CaptionCell({ value, onChange, onBlur, serial }) {
  const hasCopyableCaption = Boolean(value.trim());

  return (
    <div className="caption-cell">
      <SheetCell
        value={value}
        placeholder="Caption"
        onChange={onChange}
        onBlur={onBlur}
        ariaLabel={`Caption for plan ${serial}`}
        minRows={3}
        className={hasCopyableCaption ? 'cell-input--caption' : ''}
      />
      <CopyTextButton
        value={value}
        label={`Copy caption for plan ${serial}`}
        className="absolute right-1.5 top-1.5"
      />
    </div>
  );
}

export default function Plan() {
  const { plan, loading, error, updatePlan, flushPlan, addPlan, deletePlan } = usePlan();
  const { characters } = useCharacters();
  const { state } = useLocation();
  const highlightId = state?.highlightId;
  const [screensModalRow, setScreensModalRow] = useState(null);
  const sortedPlan = useMemo(() => sortPlansByRecent(plan), [plan]);

  useEffect(() => {
    if (!highlightId) return undefined;

    const row = document.querySelector(`[data-plan-id="${highlightId}"]`);
    row?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    row?.classList.add('plan-row--highlight');

    const timer = window.setTimeout(() => {
      row?.classList.remove('plan-row--highlight');
    }, 2400);

    return () => window.clearTimeout(timer);
  }, [highlightId, sortedPlan.length]);

  return (
    <div className="plan-page">
      <PageHeader
        title="Plan"
        description="Generated reel plans with hooks, screen copy, and captions."
      >
        <DataStatus loading={loading} error={error} />
        <p className="text-sm text-muted-foreground">Edits save automatically for the whole team.</p>
      </PageHeader>

      <div className="data-table-wrap data-table-wrap--sheet">
        <table className="data-table data-table--sheet">
          <thead>
            <tr>
              <th className="col-id">#</th>
              <th className="col-hook">Hook</th>
              <th className="col-goal-name">Goal name</th>
              <th className="col-character-name">Character</th>
              <th className="col-screens">Screens</th>
              <th className="col-ref-video">Reference</th>
              <th className="col-caption">Caption</th>
              <th className="col-status">Status</th>
              <th className="col-actions" aria-label="Actions" />
              <th className="col-date">Generated</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlan.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                  No plans yet. Use &ldquo;Add row&rdquo; below to create one.
                </td>
              </tr>
            ) : (
              sortedPlan.map((row) => {
                const serial = formatPlanSerial(row.id);
                const sequenceLabel = screenSequenceButtonLabel(row.screenSequenceName);

                return (
                  <tr key={row.id} data-plan-id={row.id}>
                    <td className="col-id sheet-cell-static">{serial}</td>
                    <td className="col-hook">
                      <SheetCell
                        value={row.hook}
                        placeholder="Hook"
                        onChange={(value) =>
                          updatePlan(row.id, { hook: value })
                        }
                        onBlur={() => flushPlan(row.id)}
                        ariaLabel={`Hook for plan ${serial}`}
                      />
                    </td>
                    <td className="col-goal-name">
                      <SheetCell
                        value={row.goalName}
                        placeholder="Goal name"
                        onChange={(value) =>
                          updatePlan(row.id, { goalName: value })
                        }
                        onBlur={() => flushPlan(row.id)}
                        ariaLabel={`Goal name for plan ${serial}`}
                      />
                    </td>
                    <td className="col-character-name sheet-cell-static">
                      <select
                        className="h-9 w-full min-w-0 rounded-none border-0 bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                        value={row.characterName}
                        onChange={(e) =>
                          updatePlan(
                            row.id,
                            { characterName: e.target.value },
                            { immediate: true }
                          )
                        }
                        aria-label={`Character for plan ${serial}`}
                      >
                        <option value="">—</option>
                        {characters.map((character) => (
                          <option key={character.id} value={character.name}>
                            {character.name.trim() || `Character ${character.id}`}
                          </option>
                        ))}
                        {row.characterName &&
                        !characters.some(
                          (character) => character.name === row.characterName
                        ) ? (
                          <option value={row.characterName}>{row.characterName}</option>
                        ) : null}
                      </select>
                    </td>
                    <td className="col-screens sheet-cell-static text-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setScreensModalRow(row)}
                        aria-label={`${sequenceLabel} for plan ${serial}`}
                      >
                        {sequenceLabel}
                      </Button>
                    </td>
                    <td className="col-ref-video sheet-cell-static text-center">
                      {row.referenceVideoLink.trim() ? (
                        <Button
                          render={
                            <a
                              href={normalizeExternalUrl(row.referenceVideoLink)}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          }
                          variant="outline"
                          size="sm"
                          aria-label={`Reference video for plan ${serial}`}
                        >
                          Reference
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="col-caption">
                      <CaptionCell
                        value={row.caption}
                        serial={serial}
                        onChange={(value) =>
                          updatePlan(row.id, { caption: value })
                        }
                        onBlur={() => flushPlan(row.id)}
                      />
                    </td>
                    <td className="col-status sheet-cell-static">
                      <select
                        className="h-9 w-full min-w-0 rounded-none border-0 bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                        value={row.status}
                        onChange={(e) =>
                          updatePlan(
                            row.id,
                            { status: e.target.value },
                            { immediate: true }
                          )
                        }
                        aria-label={`Status for plan ${serial}`}
                      >
                        {PLAN_STATUSES.map(({ value, label }) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="col-actions sheet-cell-static text-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => deletePlan(row.id)}
                        aria-label={`Delete plan ${serial}`}
                      >
                        Delete
                      </Button>
                    </td>
                    <td className="col-date">
                      <SheetCell
                        value={row.generatedDate}
                        placeholder="Jun 24"
                        onChange={(value) =>
                          updatePlan(row.id, { generatedDate: value })
                        }
                        onBlur={() => flushPlan(row.id)}
                        ariaLabel={`Generated date for plan ${serial}`}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <AddRowButton onClick={addPlan} />

      {screensModalRow && (
        <ScreensCopyModal
          row={screensModalRow}
          onClose={() => setScreensModalRow(null)}
        />
      )}
    </div>
  );
}
