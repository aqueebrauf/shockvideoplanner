import { sortPlansByOldest } from './planSort';
import { PLAN_STATUS_NOT_STARTED } from './planStatus';

export function screenSequenceButtonLabel(name) {
  const label = name?.trim();
  return label || 'Screens';
}

export function filterPlansForHomeByCharacter(plans, characterName) {
  const needle = characterName?.trim().toLowerCase();
  if (!needle) return [];

  return sortPlansByOldest(
    plans.filter(
      (row) =>
        row.characterName?.trim().toLowerCase() === needle &&
        row.status === PLAN_STATUS_NOT_STARTED
    )
  );
}
