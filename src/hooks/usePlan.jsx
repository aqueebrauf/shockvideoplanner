import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { formatPlanDate } from '../lib/goalDateLabel';
import { PLAN_STATUS_NOT_STARTED } from '../lib/planStatus';
import {
  deletePlanById,
  fetchPlans,
  nextPlanId,
  normalizePlan,
  normalizeScreen,
  upsertPlan,
  upsertPlans,
} from '../lib/planStorage';

const SAVE_DELAY_MS = 500;

const PlanContext = createContext(null);

function usePlanState() {
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pendingRowsRef = useRef(new Map());
  const saveTimersRef = useRef(new Map());

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

  useEffect(() => {
    return () => {
      saveTimersRef.current.forEach((timer) => clearTimeout(timer));
      saveTimersRef.current.clear();
    };
  }, []);

  const persistPlan = useCallback(
    async (id) => {
      const row = pendingRowsRef.current.get(id);
      if (!row) return;

      try {
        await upsertPlan(row);
        pendingRowsRef.current.delete(id);
        setError(null);
      } catch (err) {
        setError(err.message ?? 'Failed to save plan');
        await reload();
      }
    },
    [reload]
  );

  const scheduleSave = useCallback(
    (id, immediate = false) => {
      const existing = saveTimersRef.current.get(id);
      if (existing) clearTimeout(existing);

      if (immediate) {
        saveTimersRef.current.delete(id);
        return persistPlan(id);
      }

      saveTimersRef.current.set(
        id,
        setTimeout(() => {
          saveTimersRef.current.delete(id);
          persistPlan(id);
        }, SAVE_DELAY_MS)
      );
    },
    [persistPlan]
  );

  const updatePlan = useCallback(
    (id, patch, options = {}) => {
      let updated = null;
      setPlan((prev) => {
        const next = prev.map((row) => {
          if (row.id !== id) return row;
          updated = normalizePlan({ ...row, ...patch });
          pendingRowsRef.current.set(id, updated);
          return updated;
        });
        return next;
      });

      if (!updated) return;

      scheduleSave(id, options.immediate);
    },
    [scheduleSave]
  );

  const flushPlan = useCallback(
    (id) => {
      const existing = saveTimersRef.current.get(id);
      if (existing) clearTimeout(existing);
      saveTimersRef.current.delete(id);
      return persistPlan(id);
    },
    [persistPlan]
  );

  const addPlan = useCallback(async () => {
    let created = null;
    setPlan((prev) => {
      created = normalizePlan({
        id: nextPlanId(prev),
        generatedDate: '',
        hook: '',
        goalName: '',
        characterName: '',
        screenSequenceName: '',
        screens: [],
        referenceVideoLink: '',
        caption: '',
        captionStyle: '',
        hashtagsUsed: [],
        status: PLAN_STATUS_NOT_STARTED,
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
      const existing = saveTimersRef.current.get(id);
      if (existing) clearTimeout(existing);
      saveTimersRef.current.delete(id);
      pendingRowsRef.current.delete(id);

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
    async ({ screens, hook = '', goalName = '', characterName = '', referenceVideoLink = '' }) => {
      let created = null;
      setPlan((prev) => {
        created = normalizePlan({
          id: nextPlanId(prev),
          generatedDate: formatPlanDate(),
          hook,
          goalName,
          characterName,
          screens: screens.map(normalizeScreen),
          referenceVideoLink,
          caption: '',
          captionStyle: '',
          hashtagsUsed: [],
          status: PLAN_STATUS_NOT_STARTED,
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
            characterName: entry.characterName ?? '',
            screenSequenceName: entry.screenSequenceName ?? '',
            screens: entry.screens.map(normalizeScreen),
            referenceVideoLink: entry.referenceVideoLink ?? '',
            caption: entry.caption ?? '',
            captionStyle: entry.captionStyle ?? '',
            hashtagsUsed: entry.hashtagsUsed ?? [],
            status: PLAN_STATUS_NOT_STARTED,
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
    flushPlan,
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
