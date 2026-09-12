import { useScreenSequences } from '@/hooks/useScreenSequences';

function buildSequenceSteps(sequence) {
  return [
    'Hook screen',
    ...sequence.screenIds.map((id) => `Screen ${id}`),
    'CTA',
  ];
}

export default function ScreenSequencesTable() {
  const { screenSequences } = useScreenSequences();

  return (
    <div className="data-table-wrap mt-8">
      <table className="data-table">
        <thead>
          <tr>
            <th className="w-12">#</th>
            <th>Sequence</th>
            <th>Steps</th>
          </tr>
        </thead>
        <tbody>
          {screenSequences.map((sequence, index) => {
            const steps = buildSequenceSteps(sequence);

            return (
              <tr key={sequence.id}>
                <td className="text-muted-foreground tabular-nums">{index + 1}</td>
                <td>{sequence.name}</td>
                <td>
                  <ol className="m-0 list-decimal pl-5 text-sm text-muted-foreground">
                    {steps.map((step, stepIndex) => (
                      <li key={stepIndex}>{step}</li>
                    ))}
                  </ol>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
