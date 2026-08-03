export const THIS_PERSON_HOOK_MAX_CHARS = 60;

export function clampThisPersonHook(text, max = THIS_PERSON_HOOK_MAX_CHARS) {
  const trimmed = String(text ?? '').trim();
  if (trimmed.length <= max) return trimmed;

  const cut = trimmed.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > max * 0.5) {
    return cut.slice(0, lastSpace).trim();
  }
  return cut.trim();
}

export function mergeThisPersonCaption(caption, hashtag) {
  return [caption?.trim(), hashtag?.trim()].filter(Boolean).join(' ');
}

export function getGoalsWithThisPersonEntries(thisPeople, goals) {
  const maxEntryIdByGoal = new Map();

  for (const entry of thisPeople) {
    if (entry.goalId == null) continue;
    maxEntryIdByGoal.set(
      entry.goalId,
      Math.max(maxEntryIdByGoal.get(entry.goalId) ?? 0, entry.id)
    );
  }

  return goals
    .filter((goal) => maxEntryIdByGoal.has(goal.id))
    .sort(
      (a, b) =>
        (maxEntryIdByGoal.get(b.id) ?? 0) - (maxEntryIdByGoal.get(a.id) ?? 0)
    );
}

import { PLAN_STATUS_COMPLETED } from './planStatus';

export function filterThisPeopleByGoalId(thisPeople, goalId) {
  return thisPeople
    .filter((entry) => entry.goalId === goalId)
    .sort((a, b) => a.id - b.id);
}

export function splitThisPeopleByCompletion(entries) {
  const active = [];
  const completed = [];

  for (const entry of entries) {
    if (entry.status === PLAN_STATUS_COMPLETED) {
      completed.push(entry);
    } else {
      active.push(entry);
    }
  }

  return { active, completed };
}
