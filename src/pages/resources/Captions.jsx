import DataStatus from '../../components/DataStatus';
import { AddRowButton, DeleteRowButton } from '@/components/table/TableActions';
import { TableTextarea } from '@/components/table/TableField';
import { useCaptions } from '../../hooks/useCaptions';

function autoResize(e) {
  e.target.style.height = 'auto';
  e.target.style.height = `${e.target.scrollHeight}px`;
}

function CaptionTextarea({ value, onChange, placeholder, ariaLabel }) {
  return (
    <TableTextarea
      value={value}
      rows={1}
      placeholder={placeholder}
      onChange={onChange}
      onInput={autoResize}
      aria-label={ariaLabel}
    />
  );
}

export default function Captions() {
  const { captions, loading, error, updateCaption, addCaption, deleteCaption } = useCaptions();

  return (
    <>
      <DataStatus loading={loading} error={error} />
      <p className="mb-3 text-sm text-muted-foreground">
        Caption style templates for the AI caption writer. Edits save automatically for the
        whole team.
      </p>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th className="min-w-36">Style</th>
              <th className="min-w-48">Structure</th>
              <th className="min-w-48">How to write</th>
              <th className="min-w-48">Example</th>
              <th className="w-24" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {captions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No caption styles yet. Use &ldquo;Add row&rdquo; below to create one.
                </td>
              </tr>
            ) : (
              captions.map((row, index) => (
                <tr key={row.id}>
                  <td className="text-muted-foreground tabular-nums">{index + 1}</td>
                  <td>
                    <CaptionTextarea
                      value={row.style}
                      placeholder="Style name"
                      ariaLabel={`Style ${index + 1}`}
                      onChange={(e) =>
                        updateCaption(row.id, { style: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <CaptionTextarea
                      value={row.structure}
                      placeholder="Line structure"
                      ariaLabel={`Structure for ${row.style || index + 1}`}
                      onChange={(e) =>
                        updateCaption(row.id, { structure: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <CaptionTextarea
                      value={row.guide}
                      placeholder="Writing instructions"
                      ariaLabel={`Guide for ${row.style || index + 1}`}
                      onChange={(e) =>
                        updateCaption(row.id, { guide: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <CaptionTextarea
                      value={row.example}
                      placeholder="Example caption"
                      ariaLabel={`Example for ${row.style || index + 1}`}
                      onChange={(e) =>
                        updateCaption(row.id, { example: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <DeleteRowButton
                      onClick={() => deleteCaption(row.id)}
                      label={`Delete caption style ${index + 1}`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <AddRowButton onClick={addCaption} />
    </>
  );
}
