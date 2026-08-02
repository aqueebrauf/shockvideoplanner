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

export function filterThisPeopleByGoalId(thisPeople, goalId) {
  return thisPeople
    .filter((entry) => entry.goalId === goalId)
    .sort((a, b) => a.id - b.id);
}
