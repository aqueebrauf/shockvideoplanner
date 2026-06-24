import { CATEGORIES } from '../../lib/hashtagsStorage';
import { useHashtags } from '../../hooks/useHashtags';

export default function Hashtags() {
  const { hashtags, updateHashtag, addHashtag, deleteHashtag } = useHashtags();

  return (
    <>
      <p className="table-hint">Edits save automatically in this browser.</p>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Hashtag</th>
              <th className="col-posts">Instagram Posts</th>
              <th className="col-notes">Notes</th>
              <th className="col-category">Category</th>
              <th className="col-actions" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {hashtags.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-state">
                  No hashtags yet. Use &ldquo;Add row&rdquo; below to create one.
                </td>
              </tr>
            ) : (
              hashtags.map((row, index) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="text"
                      className="cell-input"
                      value={row.hashtag}
                      placeholder="#example"
                      onChange={(e) =>
                        updateHashtag(row.id, { hashtag: e.target.value })
                      }
                      aria-label={`Hashtag ${index + 1}`}
                    />
                  </td>
                  <td className="col-posts">
                    <input
                      type="number"
                      className="cell-input cell-input--number"
                      value={row.posts ?? ''}
                      min={0}
                      placeholder="0"
                      onChange={(e) => {
                        const raw = e.target.value;
                        updateHashtag(row.id, {
                          posts: raw === '' ? null : Number(raw),
                        });
                      }}
                      aria-label={`Instagram posts for ${row.hashtag || index + 1}`}
                    />
                  </td>
                  <td className="col-notes">
                    <textarea
                      className="cell-input"
                      value={row.notes}
                      rows={1}
                      placeholder="Add a note…"
                      onChange={(e) =>
                        updateHashtag(row.id, { notes: e.target.value })
                      }
                      onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      aria-label={`Notes for ${row.hashtag || index + 1}`}
                    />
                  </td>
                  <td className="col-category">
                    <select
                      className={`cell-select cell-select--${row.category}`}
                      value={row.category}
                      onChange={(e) =>
                        updateHashtag(row.id, { category: e.target.value })
                      }
                      aria-label={`Category for ${row.hashtag || index + 1}`}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="col-actions">
                    <button
                      type="button"
                      className="btn-ghost btn-danger"
                      onClick={() => deleteHashtag(row.id)}
                      aria-label={`Delete hashtag ${index + 1}`}
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
      <button type="button" className="btn-add-row" onClick={addHashtag}>
        + Add row
      </button>
    </>
  );
}
