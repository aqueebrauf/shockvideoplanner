import DataStatus from '../../components/DataStatus';
import { AddRowButton, DeleteRowButton } from '@/components/table/TableActions';
import { TableInput } from '@/components/table/TableField';
import { cn } from '@/lib/utils';
import {
  CATEGORIES,
  formatThemes,
  parseThemesInput,
} from '../../lib/hashtagsStorage';
import { useHashtags } from '../../hooks/useHashtags';

export default function Hashtags() {
  const { hashtags, loading, error, updateHashtag, addHashtag, deleteHashtag } = useHashtags();

  return (
    <>
      <DataStatus loading={loading} error={error} />
      <p className="mb-3 text-sm text-muted-foreground">
        Themes help the caption AI pick relevant tags for each goal. Comma-separated
        (e.g. study, goals, habits). Edits save automatically for the whole team.
      </p>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Hashtag</th>
              <th className="w-32">Instagram Posts</th>
              <th className="w-32">Category</th>
              <th className="min-w-40">Themes</th>
              <th className="w-24" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {hashtags.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  No hashtags yet. Use &ldquo;Add row&rdquo; below to create one.
                </td>
              </tr>
            ) : (
              hashtags.map((row, index) => (
                <tr key={row.id}>
                  <td>
                    <TableInput
                      type="text"
                      value={row.hashtag}
                      placeholder="#example"
                      onChange={(e) =>
                        updateHashtag(row.id, { hashtag: e.target.value })
                      }
                      aria-label={`Hashtag ${index + 1}`}
                    />
                  </td>
                  <td>
                    <TableInput
                      type="number"
                      className="max-w-28 tabular-nums"
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
                  <td>
                    <select
                      className={cn(
                        'h-9 w-full min-w-0 rounded-none border-0 bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                        `cell-select--${row.category}`
                      )}
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
                  <td>
                    <TableInput
                      type="text"
                      value={formatThemes(row.themes)}
                      placeholder="goals, habits"
                      onChange={(e) =>
                        updateHashtag(row.id, {
                          themes: parseThemesInput(e.target.value),
                        })
                      }
                      aria-label={`Themes for ${row.hashtag || index + 1}`}
                    />
                  </td>
                  <td>
                    <DeleteRowButton
                      onClick={() => deleteHashtag(row.id)}
                      label={`Delete hashtag ${index + 1}`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <AddRowButton onClick={addHashtag} />
    </>
  );
}
