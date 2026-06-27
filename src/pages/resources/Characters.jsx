import DataStatus from '../../components/DataStatus';
import { AddRowButton, DeleteRowButton } from '@/components/table/TableActions';
import { TableInput } from '@/components/table/TableField';
import { useCharacters } from '../../hooks/useCharacters';

export default function Characters() {
  const { characters, loading, error, updateCharacter, addCharacter, deleteCharacter } =
    useCharacters();

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
              <th>Character</th>
              <th className="w-24" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {characters.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">
                  No characters yet. Use &ldquo;Add row&rdquo; below to create one.
                </td>
              </tr>
            ) : (
              characters.map((row, index) => (
                <tr key={row.id}>
                  <td className="text-muted-foreground tabular-nums">{index + 1}</td>
                  <td>
                    <TableInput
                      type="text"
                      value={row.name}
                      placeholder="Character name"
                      onChange={(e) =>
                        updateCharacter(row.id, { name: e.target.value })
                      }
                      aria-label={`Character ${index + 1}`}
                    />
                  </td>
                  <td>
                    <DeleteRowButton
                      onClick={() => deleteCharacter(row.id)}
                      label={`Delete character ${index + 1}`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <AddRowButton onClick={addCharacter} />
    </>
  );
}
