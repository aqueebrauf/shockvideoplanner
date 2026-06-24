export const DEFAULT_SEQUENCE_ID = 'primary-demo';

export const SCREEN_SEQUENCES = [
  {
    id: 'primary-demo',
    name: 'Primary Demo',
    screenIds: [2, 4, 9, 11, 12],
  },
];

export function getScreenSequence(id) {
  return SCREEN_SEQUENCES.find((sequence) => sequence.id === id);
}

export function buildPlanScreensFromSequence(
  sequenceId,
  screens,
  { ctaText = '', hookText = '' } = {}
) {
  const sequence = getScreenSequence(sequenceId);
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
