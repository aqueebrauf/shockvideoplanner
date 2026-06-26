import DataStatus from '../../components/DataStatus';
import { AddRowButton, DeleteRowButton } from '@/components/table/TableActions';
import { TableInput } from '@/components/table/TableField';
import { useCtas } from '../../hooks/useCtas';

export default function Ctas() {
  const { ctas, loading, error, updateCta, addCta, deleteCta } = useCtas();

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
              <th>CTA</th>
              <th className="w-24" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {ctas.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">
                  No CTAs yet. Use &ldquo;Add row&rdquo; below to create one.
                </td>
              </tr>
            ) : (
              ctas.map((row, index) => (
                <tr key={row.id}>
                  <td className="text-muted-foreground tabular-nums">{index + 1}</td>
                  <td>
                    <TableInput
                      type="text"
                      value={row.text}
                      placeholder="CTA text"
                      onChange={(e) =>
                        updateCta(row.id, { text: e.target.value })
                      }
                      aria-label={`CTA ${index + 1}`}
                    />
                  </td>
                  <td>
                    <DeleteRowButton
                      onClick={() => deleteCta(row.id)}
                      label={`Delete CTA ${index + 1}`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <AddRowButton onClick={addCta} />
    </>
  );
}
