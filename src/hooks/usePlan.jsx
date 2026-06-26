import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { formatPlanDate } from '../lib/goalDateLabel';
import {
  deletePlanById,
  fetchPlans,
  nextPlanId,
  normalizePlan,
  normalizeScreen,
  upsertPlan,
  upsertPlans,
} from '../lib/planStorage';

const PlanContext = createContext(null);

function usePlanState() {
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    const data = await fetchPlans();
    setPlan(data);
    return data;
  }, []);

  useEffect(() => {
    let active = true;
    fetchPlans()
      .then((data) => {
        if (active) setPlan(data);
      })
      .catch((err) => {
        if (active) setError(err.message ?? 'Failed to load plans');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const updatePlan = useCallback(
    async (id, patch) => {
      let updated = null;
      setPlan((prev) => {
        const next = prev.map((row) => {
          if (row.id !== id) return row;
          updated = normalizePlan({ ...row, ...patch });
          return updated;
        });
        return next;
      });

      if (!updated) return;

      try {
        await upsertPlan(updated);
        setError(null);
      } catch (err) {
        setError(err.message ?? 'Failed to save plan');
        await reload();
      }
    },
    [reload]
  );

  const addPlan = useCallback(async () => {
    let created = null;
    setPlan((prev) => {
      created = normalizePlan({
        id: nextPlanId(prev),
        generatedDate: '',
        hook: '',
        goalName: '',
        screens: [],
        referenceVideoLink: '',
        caption: '',
      });
      return [...prev, created];
    });

    try {
      await upsertPlan(created);
      setError(null);
    } catch (err) {
      setError(err.message ?? 'Failed to add plan');
      await reload();
    }
  }, [reload]);

  const deletePlan = useCallback(
    async (id) => {
      setPlan((prev) => prev.filter((row) => row.id !== id));

      try {
        await deletePlanById(id);
        setError(null);
      } catch (err) {
        setError(err.message ?? 'Failed to delete plan');
        await reload();
      }
    },
    [reload]
  );

  const addGeneratedPlan = useCallback(
    async ({ screens, hook = '', goalName = '', referenceVideoLink = '' }) => {
      let created = null;
      setPlan((prev) => {
        created = normalizePlan({
          id: nextPlanId(prev),
          generatedDate: formatPlanDate(),
          hook,
          goalName,
          screens: screens.map(normalizeScreen),
          referenceVideoLink,
          caption: '',
        });
        return [...prev, created];
      });

      try {
        await upsertPlan(created);
        setError(null);
      } catch (err) {
        setError(err.message ?? 'Failed to save generated plan');
        await reload();
      }

      return created.id;
    },
    [reload]
  );

  const addGeneratedPlans = useCallback(
    async (entries) => {
      if (entries.length === 0) return [];

      let newRows = [];
      setPlan((prev) => {
        let startId = nextPlanId(prev);
        newRows = entries.map((entry) => {
          const row = normalizePlan({
            id: startId,
            generatedDate: formatPlanDate(),
            hook: entry.hook ?? '',
            goalName: entry.goalName ?? '',
            screens: entry.screens.map(normalizeScreen),
            referenceVideoLink: entry.referenceVideoLink ?? '',
            caption: '',
          });
          startId += 1;
          return row;
        });
        return [...prev, ...newRows];
      });

      try {
        await upsertPlans(newRows);
        setError(null);
      } catch (err) {
        setError(err.message ?? 'Failed to save generated plans');
        await reload();
      }

      return newRows.map((row) => row.id);
    },
    [reload]
  );

  return {
    plan,
    loading,
    error,
    updatePlan,
    addPlan,
    deletePlan,
    addGeneratedPlan,
    addGeneratedPlans,
  };
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
