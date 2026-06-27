import { sortPlansByOldest } from './planSort';
import { PLAN_STATUS_COMPLETED, PLAN_STATUS_NOT_STARTED } from './planStatus';

export function screenSequenceButtonLabel(name) {
  const label = name?.trim();
  return label || 'Screens';
}

export function filterPlansByCharacterId(plans, characterId) {
  if (characterId == null) return [];
  return plans.filter((row) => row.characterId === characterId);
}

export function getCharacterPlanStats(plans, characterId) {
  const characterPlans = filterPlansByCharacterId(plans, characterId);
  let completed = 0;
  let notStarted = 0;

  for (const row of characterPlans) {
    if (row.status === PLAN_STATUS_COMPLETED) {
      completed += 1;
    } else if (row.status === PLAN_STATUS_NOT_STARTED) {
      notStarted += 1;
    }
  }

  return {
    total: characterPlans.length,
    completed,
    notStarted,
  };
}

export function filterPlansForHomeByCharacterId(
  plans,
  characterId,
  status = PLAN_STATUS_NOT_STARTED
) {
  return sortPlansByOldest(
    filterPlansByCharacterId(plans, characterId).filter((row) => row.status === status)
  );
}
