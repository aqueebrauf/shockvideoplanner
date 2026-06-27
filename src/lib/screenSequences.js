export const DEFAULT_SEQUENCE_ID = 'primary-demo';

export function getScreenSequence(sequenceId, screenSequences) {
  if (sequenceId == null || sequenceId === '') return null;
  return (
    screenSequences.find((sequence) => String(sequence.id) === String(sequenceId)) ?? null
  );
}

export function buildPlanScreensFromSequence(
  sequenceId,
  screens,
  screenSequences,
  { ctaText = '', hookText = '' } = {}
) {
  const sequence = getScreenSequence(sequenceId, screenSequences);
  if (!sequence) {
    throw new Error('Select a screen sequence.');
  }

  const screenById = Object.fromEntries(screens.map((screen) => [screen.id, screen]));

  return [
    { name: 'Hook screen', copy: hookText.trim() },
    ...sequence.screenIds
      .filter((id) => screenById[id])
      .map((id) => ({
        name: screenById[id].name,
        copy: screenById[id].suggestedCopy?.trim() ?? '',
      })),
    { name: 'CTA', copy: ctaText.trim() },
  ];
}
