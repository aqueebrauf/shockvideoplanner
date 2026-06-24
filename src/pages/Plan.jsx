import { useEffect, useRef } from 'react';
import { usePlan } from '../hooks/usePlan';
import { screensToText, textToScreens } from '../lib/planScreensText';

function SheetCell({
  value,
  onChange,
  ariaLabel,
  placeholder,
  minRows = 1,
  className = '',
}) {
  const ref = useRef(null);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    resize();
  }, [value]);

  return (
    <textarea
      ref={ref}
      className={`cell-input cell-input--sheet ${className}`.trim()}
      value={value}
      placeholder={placeholder}
      rows={minRows}
      onChange={(e) => {
        onChange(e.target.value);
        resize();
      }}
      aria-label={ariaLabel}
    />
  );
}

export default function Plan() {
  const { plan, updatePlan, addPlan, deletePlan } = usePlan();

  return (
    <div className="plan-page">
      <h2 className="page-title">Plan</h2>
      <p className="page-subtitle">
        Generated reel plans with hooks, screen copy, and captions.
      </p>

      <p className="table-hint">Edits save automatically in this browser.</p>
      <div className="data-table-wrap data-table-wrap--sheet">
        <table className="data-table data-table--sheet">
          <thead>
            <tr>
              <th className="col-id">#</th>
              <th className="col-date">Generated</th>
              <th className="col-hook">Hook</th>
              <th className="col-goal-name">Goal name</th>
              <th className="col-screens-copy">Screens with Copy</th>
              <th className="col-ref-video">Reference Video</th>
              <th className="col-caption">Caption</th>
              <th className="col-actions" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {plan.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-state">
                  No plans yet. Use &ldquo;Add row&rdquo; below to create one.
                </td>
              </tr>
            ) : (
              plan.map((row, index) => (
                <tr key={row.id}>
                  <td className="col-id sheet-cell-static">{index + 1}</td>
                  <td className="col-date">
                    <SheetCell
                      value={row.generatedDate}
                      placeholder="Jun 24"
                      onChange={(value) =>
                        updatePlan(row.id, { generatedDate: value })
                      }
                      ariaLabel={`Generated date for plan ${index + 1}`}
                    />
                  </td>
                  <td className="col-hook">
                    <SheetCell
                      value={row.hook}
                      placeholder="Hook"
                      onChange={(value) =>
                        updatePlan(row.id, { hook: value })
                      }
                      ariaLabel={`Hook for plan ${index + 1}`}
                    />
                  </td>
                  <td className="col-goal-name">
                    <SheetCell
                      value={row.goalName}
                      placeholder="Goal name"
                      onChange={(value) =>
                        updatePlan(row.id, { goalName: value })
                      }
                      ariaLabel={`Goal name for plan ${index + 1}`}
                    />
                  </td>
                  <td className="col-screens-copy">
                    <SheetCell
                      value={screensToText(row.screens)}
                      placeholder={'Screen name\nCopy for this screen\n\nNext screen name\nCopy for next screen'}
                      onChange={(value) =>
                        updatePlan(row.id, { screens: textToScreens(value) })
                      }
                      ariaLabel={`Screens with copy for plan ${index + 1}`}
                      minRows={4}
                      className="cell-input--screens-copy"
                    />
                  </td>
                  <td className="col-ref-video sheet-cell-static">
                    {row.referenceVideoLink.trim() ? (
                      <a
                        href={row.referenceVideoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-open link-open--button"
                        aria-label={`Reference video for plan ${index + 1}`}
                      >
                        Reference
                      </a>
                    ) : (
                      <span className="cell-muted">—</span>
                    )}
                  </td>
                  <td className="col-caption">
                    <SheetCell
                      value={row.caption}
                      placeholder="Caption"
                      onChange={(value) =>
                        updatePlan(row.id, { caption: value })
                      }
                      ariaLabel={`Caption for plan ${index + 1}`}
                      minRows={3}
                    />
                  </td>
                  <td className="col-actions sheet-cell-static">
                    <button
                      type="button"
                      className="btn-ghost btn-danger"
                      onClick={() => deletePlan(row.id)}
                      aria-label={`Delete plan ${index + 1}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <button type="button" className="btn-add-row" onClick={addPlan}>
        + Add row
      </button>
    </div>
  );
}
