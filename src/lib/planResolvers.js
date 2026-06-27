export function findCharacter(characters, characterId) {
  if (characterId == null) return null;
  return characters.find((character) => character.id === characterId) ?? null;
}

export function findGoal(goals, goalId) {
  if (goalId == null) return null;
  return goals.find((goal) => goal.id === goalId) ?? null;
}

export function findScreenSequence(screenSequences, sequenceId) {
  if (sequenceId == null || sequenceId === '') return null;
  return (
    screenSequences.find((sequence) => String(sequence.id) === String(sequenceId)) ?? null
  );
}

export function findCaptionStyle(captions, captionStyleId) {
  if (captionStyleId == null) return null;
  return captions.find((caption) => caption.id === captionStyleId) ?? null;
}

export function resolveCharacterName(plan, characters) {
  return findCharacter(characters, plan.characterId)?.name?.trim() ?? '';
}

export function resolveGoalTitle(plan, goals) {
  return findGoal(goals, plan.goalId)?.title?.trim() ?? '';
}

export function resolveScreenSequenceName(plan, screenSequences) {
  return findScreenSequence(screenSequences, plan.screenSequenceId)?.name?.trim() ?? '';
}

export function resolveCaptionStyleLabel(plan, captions) {
  const linked = findCaptionStyle(captions, plan.captionStyleId);
  if (linked?.style?.trim()) return linked.style.trim();
  if (plan.captionStyle?.trim()) return plan.captionStyle.trim();
  return '';
}
