import ImageCell from '../../components/ImageCell';
import { useScreens } from '../../hooks/useScreens';

export default function Screens() {
  const { screens, updateScreen } = useScreens();

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
            </tr>
          </thead>
          <tbody>
            {screens.map((screen) => (
              <tr key={screen.id}>
                <td className="col-id">{screen.id}</td>
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
                    aria-label={`Screen ${screen.id} name`}
                  />
                </td>
                <td className="col-image">
                  <ImageCell
                    image={screen.image}
                    onChange={(image) => updateScreen(screen.id, { image })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
