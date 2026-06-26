import DataStatus from '../../components/DataStatus';
import { useGoals } from '../../hooks/useGoals';

export default function Goals() {
  const { goals, loading, error, updateGoal, addGoal, deleteGoal } = useGoals();

  return (
    <>
      <DataStatus loading={loading} error={error} />
      <p className="table-hint">Edits save automatically for the whole team.</p>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-id">#</th>
              <th>Title</th>
              <th className="col-date">Date</th>
              <th className="col-link">Link</th>
              <th className="col-actions" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {goals.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-state">
                  No goals yet. Use &ldquo;Add row&rdquo; below to create one.
                </td>
              </tr>
            ) : (
              goals.map((row, index) => (
                <tr key={row.id}>
                  <td className="col-id">{index + 1}</td>
                  <td>
                    <input
                      type="text"
                      className="cell-input"
                      value={row.title}
                      placeholder="Goal title"
                      onChange={(e) =>
                        updateGoal(row.id, { title: e.target.value })
                      }
                      aria-label={`Title for goal ${index + 1}`}
                    />
                  </td>
                  <td className="col-date">
                    <input
                      type="text"
                      className="cell-input cell-input--date"
                      value={row.date}
                      placeholder="Jun 20"
                      onChange={(e) =>
                        updateGoal(row.id, { date: e.target.value })
                      }
                      aria-label={`Date for goal ${index + 1}`}
                    />
                  </td>
                  <td className="col-link">
                    <div className="link-cell">
                      <input
                        type="url"
                        className="cell-input"
                        value={row.link}
                        placeholder="https://"
                        onChange={(e) =>
                          updateGoal(row.id, { link: e.target.value })
                        }
                        aria-label={`Link for goal ${index + 1}`}
                      />
                      {row.link.trim() && (
                        <a
                          href={row.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-open"
                          aria-label={`Open link for goal ${index + 1}`}
                        >
                          Open
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="col-actions">
                    <button
                      type="button"
                      className="btn-ghost btn-danger"
                      onClick={() => deleteGoal(row.id)}
                      aria-label={`Delete goal ${index + 1}`}
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
      <button type="button" className="btn-add-row" onClick={addGoal}>
        + Add row
      </button>
    </>
  );
}
