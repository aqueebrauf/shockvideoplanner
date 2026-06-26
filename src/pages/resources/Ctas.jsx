import DataStatus from '../../components/DataStatus';
import { useCtas } from '../../hooks/useCtas';

export default function Ctas() {
  const { ctas, loading, error, updateCta, addCta, deleteCta } = useCtas();

  return (
    <>
      <DataStatus loading={loading} error={error} />
      <p className="table-hint">Edits save automatically for the whole team.</p>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-id">#</th>
              <th>CTA</th>
              <th className="col-actions" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {ctas.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty-state">
                  No CTAs yet. Use &ldquo;Add row&rdquo; below to create one.
                </td>
              </tr>
            ) : (
              ctas.map((row, index) => (
                <tr key={row.id}>
                  <td className="col-id">{index + 1}</td>
                  <td>
                    <input
                      type="text"
                      className="cell-input"
                      value={row.text}
                      placeholder="CTA text"
                      onChange={(e) =>
                        updateCta(row.id, { text: e.target.value })
                      }
                      aria-label={`CTA ${index + 1}`}
                    />
                  </td>
                  <td className="col-actions">
                    <button
                      type="button"
                      className="btn-ghost btn-danger"
                      onClick={() => deleteCta(row.id)}
                      aria-label={`Delete CTA ${index + 1}`}
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
      <button type="button" className="btn-add-row" onClick={addCta}>
        + Add row
      </button>
    </>
  );
}
