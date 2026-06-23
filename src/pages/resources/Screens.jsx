import screens from '../../data/screens.json';

export default function Screens() {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th className="col-id">#</th>
            <th>Screen</th>
          </tr>
        </thead>
        <tbody>
          {screens.map((screen) => (
            <tr key={screen.id}>
              <td className="col-id">{screen.id}</td>
              <td>{screen.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
