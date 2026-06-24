import { useCallback, useState } from 'react';
import baseline from '../data/plan.json';
import {
  loadPlan,
  nextPlanId,
  normalizePlan,
  savePlan,
} from '../lib/planStorage';

function commit(setPlan, updater) {
  setPlan((prev) => {
    const next = updater(prev).map(normalizePlan);
    savePlan(next);
    return next;
  });
}

export function usePlan() {
  const [plan, setPlan] = useState(() => loadPlan(baseline));

  const updatePlan = useCallback((id, patch) => {
    commit(setPlan, (prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  }, []);

  const addPlan = useCallback(() => {
    commit(setPlan, (prev) => [
      ...prev,
      {
        id: nextPlanId(prev),
        generatedDate: '',
        hook: '',
        goalName: '',
        screens: [],
        referenceVideoLink: '',
        caption: '',
      },
    ]);
  }, []);

  const deletePlan = useCallback((id) => {
    commit(setPlan, (prev) => prev.filter((row) => row.id !== id));
  }, []);

  return { plan, updatePlan, addPlan, deletePlan };
}
