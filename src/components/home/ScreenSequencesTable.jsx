import { useMemo } from 'react';
import { useScreens } from '@/hooks/useScreens';
import { SCREEN_SEQUENCES } from '@/lib/screenSequences';

function buildSequenceSteps(sequence, screenById) {
  return [
    'Hook screen',
    ...sequence.screenIds.map((id) => screenById[id]?.name?.trim() || `Screen ${id}`),
    'CTA',
  ];
}

export default function ScreenSequencesTable() {
  const { screens } = useScreens();

  const screenById = useMemo(
    () => Object.fromEntries(screens.map((screen) => [screen.id, screen])),
    [screens]
  );

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
          {SCREEN_SEQUENCES.map((sequence, index) => {
            const steps = buildSequenceSteps(sequence, screenById);

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
