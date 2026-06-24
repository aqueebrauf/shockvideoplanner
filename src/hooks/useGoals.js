import { useCallback, useState } from 'react';
import baseline from '../data/goals.json';
import {
  loadGoals,
  nextGoalId,
  normalizeGoal,
  saveGoals,
} from '../lib/goalsStorage';

function commit(setGoals, updater) {
  setGoals((prev) => {
    const next = updater(prev).map(normalizeGoal);
    saveGoals(next);
    return next;
  });
}

export function useGoals() {
  const [goals, setGoals] = useState(() => loadGoals(baseline));

  const updateGoal = useCallback((id, patch) => {
    commit(setGoals, (prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...patch } : g))
    );
  }, []);

  const addGoal = useCallback(() => {
    commit(setGoals, (prev) => [
      ...prev,
      { id: nextGoalId(prev), title: '', link: '', date: '' },
    ]);
  }, []);

  const deleteGoal = useCallback((id) => {
    commit(setGoals, (prev) => prev.filter((g) => g.id !== id));
  }, []);

  return { goals, updateGoal, addGoal, deleteGoal };
}
