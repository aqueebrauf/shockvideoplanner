import { useCallback, useMemo, useState } from 'react';
import baseline from '../data/goals.json';
import {
  loadOverrides,
  mergeGoals,
  patchGoal,
  saveOverrides,
} from '../lib/goalsStorage';

export function useGoals() {
  const [overrides, setOverrides] = useState(loadOverrides);

  const goals = useMemo(
    () => mergeGoals(baseline, overrides),
    [overrides]
  );

  const updateGoal = useCallback((id, patch) => {
    setOverrides((prev) => {
      const next = patchGoal(prev, id, patch);
      saveOverrides(next);
      return next;
    });
  }, []);

  return { goals, updateGoal };
}
