import { createContext, useCallback, useContext, useState } from 'react';
import baseline from '../data/plan.json';
import { formatPlanDate } from '../lib/goalDateLabel';
import {
  loadPlan,
  nextPlanId,
  normalizePlan,
  normalizeScreen,
  savePlan,
} from '../lib/planStorage';

const PlanContext = createContext(null);

function commit(setPlan, updater) {
  setPlan((prev) => {
    const next = updater(prev).map(normalizePlan);
    savePlan(next);
    return next;
  });
}

function usePlanState() {
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

  const addGeneratedPlan = useCallback(
    ({ screens, hook = '', goalName = '', referenceVideoLink = '' }) => {
      let newId = 0;

      commit(setPlan, (prev) => {
        newId = nextPlanId(prev);
        return [
          ...prev,
          {
            id: newId,
            generatedDate: formatPlanDate(),
            hook,
            goalName,
            screens: screens.map(normalizeScreen),
            referenceVideoLink,
            caption: '',
          },
        ];
      });

      return newId;
    },
    []
  );

  return { plan, updatePlan, addPlan, deletePlan, addGeneratedPlan };
}

export function PlanProvider({ children }) {
  const value = usePlanState();
  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within PlanProvider');
  }
  return context;
}
