import { useGoals } from '../../hooks/useGoals';

export default function Goals() {
  const { goals, updateGoal } = useGoals();

  return (
    <>
      <p className="table-hint">Edits save automatically in this browser.</p>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-id">#</th>
              <th>Title</th>
              <th className="col-link">Link</th>
            </tr>
          </thead>
          <tbody>
            {goals.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty-state">
                  No goals yet. Add rows to{' '}
                  <code>src/data/goals.json</code> or ask Cursor to populate them.
                </td>
              </tr>
            ) : (
              goals.map((row) => (
                <tr key={row.id}>
                  <td className="col-id">{row.id}</td>
                  <td>
                    <input
                      type="text"
                      className="cell-input"
                      value={row.title}
                      placeholder="Goal title"
                      onChange={(e) =>
                        updateGoal(row.id, { title: e.target.value })
                      }
                      aria-label={`Title for goal ${row.id}`}
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
                        aria-label={`Link for goal ${row.id}`}
                      />
                      {row.link.trim() && (
                        <a
                          href={row.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-open"
                          aria-label={`Open link for goal ${row.id}`}
                        >
                          Open
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
