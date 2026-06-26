import DataStatus from '../../components/DataStatus';
import { AddRowButton, DeleteRowButton } from '@/components/table/TableActions';
import { TableInput } from '@/components/table/TableField';
import { Button } from '@/components/ui/button';
import { useGoals } from '../../hooks/useGoals';

export default function Goals() {
  const { goals, loading, error, updateGoal, addGoal, deleteGoal } = useGoals();

  return (
    <>
      <DataStatus loading={loading} error={error} />
      <p className="mb-3 text-sm text-muted-foreground">
        Edits save automatically for the whole team.
      </p>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>Title</th>
              <th className="w-28">Date</th>
              <th className="min-w-56">Link</th>
              <th className="w-24" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {goals.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  No goals yet. Use &ldquo;Add row&rdquo; below to create one.
                </td>
              </tr>
            ) : (
              goals.map((row, index) => (
                <tr key={row.id}>
                  <td className="text-muted-foreground tabular-nums">{index + 1}</td>
                  <td>
                    <TableInput
                      type="text"
                      value={row.title}
                      placeholder="Goal title"
                      onChange={(e) =>
                        updateGoal(row.id, { title: e.target.value })
                      }
                      aria-label={`Title for goal ${index + 1}`}
                    />
                  </td>
                  <td>
                    <TableInput
                      type="text"
                      value={row.date}
                      placeholder="Jun 20"
                      onChange={(e) =>
                        updateGoal(row.id, { date: e.target.value })
                      }
                      aria-label={`Date for goal ${index + 1}`}
                    />
                  </td>
                  <td>
                    <div className="link-cell">
                      <TableInput
                        type="url"
                        value={row.link}
                        placeholder="https://"
                        onChange={(e) =>
                          updateGoal(row.id, { link: e.target.value })
                        }
                        aria-label={`Link for goal ${index + 1}`}
                      />
                      {row.link.trim() ? (
                        <Button
                          render={
                            <a
                              href={row.link}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          }
                          variant="link"
                          size="sm"
                          className="shrink-0 px-0"
                          aria-label={`Open link for goal ${index + 1}`}
                        >
                          Open
                        </Button>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <DeleteRowButton
                      onClick={() => deleteGoal(row.id)}
                      label={`Delete goal ${index + 1}`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <AddRowButton onClick={addGoal} />
    </>
  );
}
