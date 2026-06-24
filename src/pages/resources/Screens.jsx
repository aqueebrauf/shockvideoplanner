import ImageCell from '../../components/ImageCell';
import { useScreens } from '../../hooks/useScreens';

export default function Screens() {
  const { screens, updateScreen, addScreen, deleteScreen } = useScreens();

  return (
    <>
      <p className="table-hint">Edits save automatically in this browser.</p>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-id">#</th>
              <th>Screen</th>
              <th className="col-image">Image example</th>
              <th className="col-actions" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {screens.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-state">
                  No screens yet. Use &ldquo;Add row&rdquo; below to create one.
                </td>
              </tr>
            ) : (
              screens.map((screen, index) => (
                <tr key={screen.id}>
                  <td className="col-id">{index + 1}</td>
                  <td>
                    <textarea
                      className="cell-input"
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
                  <td className="col-image">
                    <ImageCell
                      image={screen.image}
                      onChange={(image) => updateScreen(screen.id, { image })}
                    />
                  </td>
                  <td className="col-actions">
                    <button
                      type="button"
                      className="btn-ghost btn-danger"
                      onClick={() => deleteScreen(screen.id)}
                      aria-label={`Delete screen ${index + 1}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <button type="button" className="btn-add-row" onClick={addScreen}>
        + Add row
      </button>
    </>
  );
}
