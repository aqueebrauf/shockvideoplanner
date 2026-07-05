import DataStatus from '../../components/DataStatus';
import CopyTextButton from '../../components/CopyTextButton';
import { AddRowButton, DeleteRowButton } from '@/components/table/TableActions';
import { TableTextarea } from '@/components/table/TableField';
import { useVerbatims } from '../../hooks/useVerbatims';

export default function Verbatims() {
  const { verbatims, loading, error, updateVerbatim, addVerbatim, deleteVerbatim } =
    useVerbatims();

  return (
    <>
      <DataStatus loading={loading} error={error} />
      <p className="mb-3 text-sm text-muted-foreground">
        Real things the target audience says in comments. Reuse them for hooks,
        captions, and scripts. Edits save automatically for the whole team.
      </p>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>Verbatim</th>
              <th className="w-32" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {verbatims.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">
                  No verbatims yet. Use &ldquo;Add row&rdquo; below to create one.
                </td>
              </tr>
            ) : (
              verbatims.map((row, index) => (
                <tr key={row.id}>
                  <td className="text-muted-foreground tabular-nums">{index + 1}</td>
                  <td>
                    <TableTextarea
                      value={row.text}
                      placeholder="What the audience said"
                      rows={2}
                      onChange={(e) =>
                        updateVerbatim(row.id, { text: e.target.value })
                      }
                      aria-label={`Verbatim ${index + 1}`}
                    />
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <CopyTextButton
                        value={row.text}
                        label={`Copy verbatim ${index + 1}`}
                      />
                      <DeleteRowButton
                        onClick={() => deleteVerbatim(row.id)}
                        label={`Delete verbatim ${index + 1}`}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <AddRowButton onClick={addVerbatim} />
    </>
  );
}
