import { usePlan } from '../hooks/usePlan';

function ScreensWithCopyCell({ row, rowIndex, updatePlan }) {
  const screens = row.screens;

  const updateScreen = (screenIndex, patch) => {
    updatePlan(row.id, {
      screens: screens.map((screen, index) =>
        index === screenIndex ? { ...screen, ...patch } : screen
      ),
    });
  };

  const addScreen = () => {
    updatePlan(row.id, {
      screens: [...screens, { name: '', copy: '' }],
    });
  };

  const removeScreen = (screenIndex) => {
    updatePlan(row.id, {
      screens: screens.filter((_, index) => index !== screenIndex),
    });
  };

  if (screens.length === 0) {
    return (
      <div className="screens-copy-list screens-copy-list--empty">
        <span className="screens-copy-empty">No screens yet</span>
        <button
          type="button"
          className="btn-ghost btn-ghost--compact"
          onClick={addScreen}
        >
          + Add screen
        </button>
      </div>
    );
  }

  return (
    <div className="screens-copy-list">
      {screens.map((screen, screenIndex) => (
        <div key={screenIndex} className="screen-copy-item">
          <div className="screen-copy-item__header">
            <span className="screen-copy-label">
              Screen {screenIndex + 1}
            </span>
            <button
              type="button"
              className="btn-ghost btn-ghost--compact btn-danger"
              onClick={() => removeScreen(screenIndex)}
              aria-label={`Remove screen ${screenIndex + 1} from plan ${rowIndex + 1}`}
            >
              Remove
            </button>
          </div>
          <input
            type="text"
            className="cell-input cell-input--screen-name"
            value={screen.name}
            placeholder="Screen name"
            onChange={(e) => updateScreen(screenIndex, { name: e.target.value })}
            aria-label={`Screen name ${screenIndex + 1} for plan ${rowIndex + 1}`}
          />
          <textarea
            className="cell-input cell-input--screen-copy"
            value={screen.copy}
            placeholder="Copy for this screen"
            rows={2}
            onChange={(e) => updateScreen(screenIndex, { copy: e.target.value })}
            aria-label={`Copy for screen ${screenIndex + 1} in plan ${rowIndex + 1}`}
          />
        </div>
      ))}
      <button
        type="button"
        className="btn-ghost btn-ghost--compact"
        onClick={addScreen}
      >
        + Add screen
      </button>
    </div>
  );
}

export default function Plan() {
  const { plan, updatePlan, addPlan, deletePlan } = usePlan();

  return (
    <>
      <h2 className="page-title">Plan</h2>
      <p className="page-subtitle">
        Generated reel plans with hooks, screen copy, and captions.
      </p>

      <p className="table-hint">Edits save automatically in this browser.</p>
      <div className="data-table-wrap">
        <table className="data-table data-table--plan">
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
                  <td className="col-id">{index + 1}</td>
                  <td className="col-date">
                    <input
                      type="text"
                      className="cell-input cell-input--date"
                      value={row.generatedDate}
                      placeholder="Jun 24"
                      onChange={(e) =>
                        updatePlan(row.id, { generatedDate: e.target.value })
                      }
                      aria-label={`Generated date for plan ${index + 1}`}
                    />
                  </td>
                  <td className="col-hook">
                    <input
                      type="text"
                      className="cell-input"
                      value={row.hook}
                      placeholder="Hook"
                      onChange={(e) =>
                        updatePlan(row.id, { hook: e.target.value })
                      }
                      aria-label={`Hook for plan ${index + 1}`}
                    />
                  </td>
                  <td className="col-goal-name">
                    <input
                      type="text"
                      className="cell-input"
                      value={row.goalName}
                      placeholder="Goal name"
                      onChange={(e) =>
                        updatePlan(row.id, { goalName: e.target.value })
                      }
                      aria-label={`Goal name for plan ${index + 1}`}
                    />
                  </td>
                  <td className="col-screens-copy">
                    <ScreensWithCopyCell
                      row={row}
                      rowIndex={index}
                      updatePlan={updatePlan}
                    />
                  </td>
                  <td className="col-ref-video">
                    {row.referenceVideoLink.trim() ? (
                      <a
                        href={row.referenceVideoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-open link-open--button"
                        aria-label={`Open reference video for plan ${index + 1}`}
                      >
                        Open
                      </a>
                    ) : (
                      <span className="cell-muted">—</span>
                    )}
                  </td>
                  <td className="col-caption">
                    <textarea
                      className="cell-input cell-input--caption"
                      value={row.caption}
                      placeholder="Caption"
                      rows={3}
                      onChange={(e) =>
                        updatePlan(row.id, { caption: e.target.value })
                      }
                      aria-label={`Caption for plan ${index + 1}`}
                    />
                  </td>
                  <td className="col-actions">
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
    </>
  );
}
