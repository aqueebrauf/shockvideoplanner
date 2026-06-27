import DataStatus from '../../components/DataStatus';
import { AddRowButton, DeleteRowButton } from '@/components/table/TableActions';
import { TableInput, TableTextarea } from '@/components/table/TableField';
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
        Caption style templates for the AI caption writer. Hook signals drive Intelligent
        mode style selection. Edits save automatically for the whole team.
      </p>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th className="min-w-32">Style</th>
              <th className="min-w-40">Hook signals</th>
              <th className="min-w-40">Structure</th>
              <th className="min-w-40">How to write</th>
              <th className="min-w-40">Example</th>
              <th className="w-20">Max chars</th>
              <th className="w-24" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {captions.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
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
                      value={row.hookSignals}
                      placeholder="When to pick this style"
                      ariaLabel={`Hook signals for ${row.style || index + 1}`}
                      onChange={(e) =>
                        updateCaption(row.id, { hookSignals: e.target.value })
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
                    <TableInput
                      type="number"
                      className="max-w-20 tabular-nums"
                      value={row.maxChars ?? ''}
                      min={0}
                      placeholder="—"
                      onChange={(e) => {
                        const raw = e.target.value;
                        updateCaption(row.id, {
                          maxChars: raw === '' ? null : Number(raw),
                        });
                      }}
                      aria-label={`Max chars for ${row.style || index + 1}`}
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
