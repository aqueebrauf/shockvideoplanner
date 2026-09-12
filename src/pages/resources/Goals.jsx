import DataStatus from '../../components/DataStatus';
import CopyTextButton from '../../components/CopyTextButton';
import { AddRowButton, DeleteRowButton } from '@/components/table/TableActions';
import { TableDateInput, TableInput } from '@/components/table/TableField';
import { useGoals } from '../../hooks/useGoals';

const currentYear = new Date().getFullYear();
const yearStart = `${currentYear}-01-01`;
const yearEnd = `${currentYear}-12-31`;

export default function Goals() {
  const { goals, loading, error, updateGoal, flushGoal, addGoal, deleteGoal } =
    useGoals();

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
              <th className="w-44">Date</th>
              <th className="w-40">Hashtag</th>
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
                      onBlur={() => flushGoal(row.id)}
                      aria-label={`Title for goal ${index + 1}`}
                    />
                  </td>
                  <td>
                    <TableDateInput
                      value={row.date}
                      min={yearStart}
                      max={yearEnd}
                      onChange={(e) =>
                        updateGoal(row.id, { date: e.target.value })
                      }
                      onBlur={() => flushGoal(row.id)}
                      aria-label={`Date for goal ${index + 1}`}
                    />
                  </td>
                  <td>
                    <TableInput
                      type="text"
                      value={row.hashtag}
                      placeholder="#hashtag"
                      onChange={(e) =>
                        updateGoal(row.id, { hashtag: e.target.value })
                      }
                      onBlur={() => flushGoal(row.id)}
                      aria-label={`Hashtag for goal ${index + 1}`}
                    />
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <CopyTextButton
                        value={row.hashtag}
                        label={`Copy hashtag ${index + 1}`}
                      />
                      <DeleteRowButton
                        onClick={() => deleteGoal(row.id)}
                        label={`Delete goal ${index + 1}`}
                      />
                    </div>
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
