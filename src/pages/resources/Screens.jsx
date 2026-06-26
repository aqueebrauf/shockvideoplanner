import DataStatus from '../../components/DataStatus';
import ImageCell from '../../components/ImageCell';
import { AddRowButton, DeleteRowButton } from '@/components/table/TableActions';
import { TableTextarea } from '@/components/table/TableField';
import { useScreens } from '../../hooks/useScreens';

export default function Screens() {
  const { screens, loading, error, updateScreen, addScreen, deleteScreen } = useScreens();

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
              <th>Screen</th>
              <th className="min-w-32">Suggested copy</th>
              <th className="min-w-44">Image example</th>
              <th className="w-24" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {screens.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  No screens yet. Use &ldquo;Add row&rdquo; below to create one.
                </td>
              </tr>
            ) : (
              screens.map((screen, index) => (
                <tr key={screen.id}>
                  <td className="text-muted-foreground tabular-nums">{index + 1}</td>
                  <td>
                    <TableTextarea
                      value={screen.name}
                      rows={1}
                      onChange={(e) => updateScreen(screen.id, { name: e.target.value })}
                      onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      aria-label={`Screen ${index + 1} name`}
                    />
                  </td>
                  <td>
                    <TableTextarea
                      value={screen.suggestedCopy}
                      rows={1}
                      onChange={(e) =>
                        updateScreen(screen.id, { suggestedCopy: e.target.value })
                      }
                      onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      aria-label={`Suggested copy for screen ${index + 1}`}
                    />
                  </td>
                  <td>
                    <ImageCell
                      image={screen.image}
                      onChange={(image) => updateScreen(screen.id, { image })}
                    />
                  </td>
                  <td>
                    <DeleteRowButton
                      onClick={() => deleteScreen(screen.id)}
                      label={`Delete screen ${index + 1}`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <AddRowButton onClick={addScreen} />
    </>
  );
}
