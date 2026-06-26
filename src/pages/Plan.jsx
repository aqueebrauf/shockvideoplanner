import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DataStatus from '../components/DataStatus';
import ScreensCopyModal from '../components/ScreensCopyModal';
import PageHeader from '@/components/layout/PageHeader';
import { AddRowButton } from '@/components/table/TableActions';
import { Button } from '@/components/ui/button';
import { usePlan } from '../hooks/usePlan';
import { formatPlanSerial, sortPlansByRecent } from '../lib/planSort';
import { normalizeExternalUrl } from '../lib/externalUrl';

function SheetCell({
  value,
  onChange,
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
      aria-label={ariaLabel}
    />
  );
}

function CaptionCell({ value, onChange, serial }) {
  const [copied, setCopied] = useState(false);

  const copyCaption = async () => {
    if (!value.trim()) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="caption-cell">
      <SheetCell
        value={value}
        placeholder="Caption"
        onChange={onChange}
        ariaLabel={`Caption for plan ${serial}`}
        minRows={3}
        className="cell-input--caption"
      />
      <button
        type="button"
        className="caption-cell__copy"
        onClick={copyCaption}
        disabled={!value.trim()}
        aria-label={`Copy caption for plan ${serial}`}
        title={copied ? 'Copied' : 'Copy caption'}
      >
        {copied ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function Plan() {
  const { plan, loading, error, updatePlan, addPlan, deletePlan } = usePlan();
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
              <th className="col-screens">Screens</th>
              <th className="col-ref-video">Reference</th>
              <th className="col-caption">Caption</th>
              <th className="col-actions" aria-label="Actions" />
              <th className="col-date">Generated</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlan.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  No plans yet. Use &ldquo;Add row&rdquo; below to create one.
                </td>
              </tr>
            ) : (
              sortedPlan.map((row) => {
                const serial = formatPlanSerial(row.id);

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
                        ariaLabel={`Goal name for plan ${serial}`}
                      />
                    </td>
                    <td className="col-screens sheet-cell-static px-3 py-2 text-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setScreensModalRow(row)}
                        aria-label={`Screens for plan ${serial}`}
                      >
                        Screens
                      </Button>
                    </td>
                    <td className="col-ref-video sheet-cell-static px-3 py-2 text-center">
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
                      />
                    </td>
                    <td className="col-actions sheet-cell-static px-2 py-2 text-center">
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
