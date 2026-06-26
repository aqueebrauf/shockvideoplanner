import DataStatus from '../../components/DataStatus';
import { useCaptions } from '../../hooks/useCaptions';

function autoResize(e) {
  e.target.style.height = 'auto';
  e.target.style.height = `${e.target.scrollHeight}px`;
}

function CaptionTextarea({ value, onChange, placeholder, ariaLabel }) {
  return (
    <textarea
      className="cell-input"
      value={value}
      rows={1}
      placeholder={placeholder}
      onChange={onChange}
      onInput={autoResize}
      aria-label={ariaLabel}
    />
  );
}

export default function Captions() {
  const { captions, loading, error, updateCaption, addCaption, deleteCaption } = useCaptions();

  return (
    <>
      <DataStatus loading={loading} error={error} />
      <p className="table-hint">
        Caption style templates for the AI caption writer. Edits save automatically for the
        whole team.
      </p>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-id">#</th>
              <th className="col-caption-style">Style</th>
              <th className="col-caption-structure">Structure</th>
              <th className="col-caption-guide">How to write</th>
              <th className="col-caption-example">Example</th>
              <th className="col-actions" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {captions.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state">
                  No caption styles yet. Use &ldquo;Add row&rdquo; below to create one.
                </td>
              </tr>
            ) : (
              captions.map((row, index) => (
                <tr key={row.id}>
                  <td className="col-id">{index + 1}</td>
                  <td className="col-caption-style">
                    <CaptionTextarea
                      value={row.style}
                      placeholder="Style name"
                      ariaLabel={`Style ${index + 1}`}
                      onChange={(e) =>
                        updateCaption(row.id, { style: e.target.value })
                      }
                    />
                  </td>
                  <td className="col-caption-structure">
                    <CaptionTextarea
                      value={row.structure}
                      placeholder="Line structure"
                      ariaLabel={`Structure for ${row.style || index + 1}`}
                      onChange={(e) =>
                        updateCaption(row.id, { structure: e.target.value })
                      }
                    />
                  </td>
                  <td className="col-caption-guide">
                    <CaptionTextarea
                      value={row.guide}
                      placeholder="Writing instructions"
                      ariaLabel={`Guide for ${row.style || index + 1}`}
                      onChange={(e) =>
                        updateCaption(row.id, { guide: e.target.value })
                      }
                    />
                  </td>
                  <td className="col-caption-example">
                    <CaptionTextarea
                      value={row.example}
                      placeholder="Example caption"
                      ariaLabel={`Example for ${row.style || index + 1}`}
                      onChange={(e) =>
                        updateCaption(row.id, { example: e.target.value })
                      }
                    />
                  </td>
                  <td className="col-actions">
                    <button
                      type="button"
                      className="btn-ghost btn-danger"
                      onClick={() => deleteCaption(row.id)}
                      aria-label={`Delete caption style ${index + 1}`}
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
      <button type="button" className="btn-add-row" onClick={addCaption}>
        + Add row
      </button>
    </>
  );
}
