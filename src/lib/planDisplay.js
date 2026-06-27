import { sortPlansByOldest } from './planSort';
import { PLAN_STATUS_COMPLETED, PLAN_STATUS_NOT_STARTED } from './planStatus';

export function screenSequenceButtonLabel(name) {
  const label = name?.trim();
  return label || 'Screens';
}

export function filterPlansByCharacter(plans, characterName) {
  const needle = characterName?.trim().toLowerCase();
  if (!needle) return [];

  return plans.filter((row) => row.characterName?.trim().toLowerCase() === needle);
}

export function getCharacterPlanStats(plans, characterName) {
  const characterPlans = filterPlansByCharacter(plans, characterName);
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

export function filterPlansForHomeByCharacter(plans, characterName) {
  return sortPlansByOldest(
    filterPlansByCharacter(plans, characterName).filter(
      (row) => row.status === PLAN_STATUS_NOT_STARTED
    )
  );
}
