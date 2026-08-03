import { useMemo } from 'react';
import DataStatus from '../../components/DataStatus';
import CopyTextButton from '../../components/CopyTextButton';
import { AddRowButton, DeleteRowButton } from '@/components/table/TableActions';
import { TableInput } from '@/components/table/TableField';
import { useGoals } from '../../hooks/useGoals';
import { useThisPeople } from '../../hooks/useThisPeople';
import { sortGoalsByRecent } from '@/lib/goalDateLabel';

export default function ThisPerson() {
  const { thisPeople, loading, error, updateThisPerson, addThisPerson, deleteThisPerson } =
    useThisPeople();
  const { goals } = useGoals();
  const sortedGoals = useMemo(() => sortGoalsByRecent(goals), [goals]);

  const goalById = useMemo(
    () => new Map(goals.map((goal) => [goal.id, goal])),
    [goals]
  );

  return (
    <>
      <DataStatus loading={loading} error={error} />
      <p className="mb-3 text-sm text-muted-foreground">
        &ldquo;This person&rdquo; reel templates — hook, caption, and hashtag tied to a goal.
        Edits save automatically for the whole team.
      </p>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th className="w-48">Goal</th>
              <th>Hook</th>
              <th>Caption</th>
              <th className="w-40">Hashtag</th>
              <th className="w-32" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {thisPeople.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No entries yet. Use &ldquo;Add row&rdquo; below or the This person generator.
                </td>
              </tr>
            ) : (
              thisPeople.map((row, index) => {
                const goal = row.goalId ? goalById.get(row.goalId) : null;

                return (
                  <tr key={row.id}>
                    <td className="text-muted-foreground tabular-nums">{index + 1}</td>
                    <td>
                      <select
                        className="h-9 w-full min-w-0 rounded-none border-0 bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                        value={row.goalId ?? ''}
                        onChange={(e) =>
                          updateThisPerson(row.id, {
                            goalId: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        aria-label={`Goal for row ${index + 1}`}
                      >
                        <option value="">—</option>
                        {sortedGoals.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.title.trim() || `Goal ${g.id}`}
                          </option>
                        ))}
                        {row.goalId != null && !goal ? (
                          <option value={row.goalId}>Goal {row.goalId}</option>
                        ) : null}
                      </select>
                    </td>
                    <td>
                      <TableInput
                        type="text"
                        value={row.hookText}
                        placeholder="Hook text"
                        onChange={(e) =>
                          updateThisPerson(row.id, { hookText: e.target.value })
                        }
                        aria-label={`Hook ${index + 1}`}
                      />
                    </td>
                    <td>
                      <TableInput
                        type="text"
                        value={row.caption}
                        placeholder="Caption (one line)"
                        onChange={(e) =>
                          updateThisPerson(row.id, { caption: e.target.value })
                        }
                        aria-label={`Caption ${index + 1}`}
                      />
                    </td>
                    <td>
                      <TableInput
                        type="text"
                        value={row.hashtag}
                        placeholder="#hashtag"
                        onChange={(e) =>
                          updateThisPerson(row.id, { hashtag: e.target.value })
                        }
                        aria-label={`Hashtag ${index + 1}`}
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <CopyTextButton
                          value={row.hookText}
                          label={`Copy hook ${index + 1}`}
                        />
                        <CopyTextButton
                          value={row.caption}
                          label={`Copy caption ${index + 1}`}
                        />
                        <CopyTextButton
                          value={row.hashtag}
                          label={`Copy hashtag ${index + 1}`}
                        />
                        <DeleteRowButton
                          onClick={() => deleteThisPerson(row.id)}
                          label={`Delete row ${index + 1}`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <AddRowButton onClick={addThisPerson} />
    </>
  );
}
