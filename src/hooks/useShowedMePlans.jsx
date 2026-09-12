import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { PLAN_STATUS_NOT_STARTED } from '@/lib/planStatus';
import {
  deleteShowedMePlanById,
  fetchShowedMePlans,
  nextShowedMePlanId,
  normalizeShowedMePlan,
  upsertShowedMePlan,
} from '@/lib/showedMePlanStorage';
import { WORKFLOW_STATUS_DRAFT } from '@/lib/showedMeAssetTypes';

const SAVE_DELAY_MS = 500;
const ShowedMePlanContext = createContext(null);

function useShowedMePlanState() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pendingRowsRef = useRef(new Map());
  const saveTimersRef = useRef(new Map());

  const reload = useCallback(async () => {
    const data = await fetchShowedMePlans();
    setPlans(data);
    return data;
  }, []);

  useEffect(() => {
    let active = true;
    fetchShowedMePlans()
      .then((data) => {
        if (active) setPlans(data);
      })
      .catch((err) => {
        if (active) setError(err.message ?? 'Failed to load Showed Me plans');
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
        await upsertShowedMePlan(row);
        pendingRowsRef.current.delete(id);
        setError(null);
      } catch (err) {
        setError(err.message ?? 'Failed to save Showed Me plan');
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
      setPlans((prev) => {
        const next = prev.map((row) => {
          if (row.id !== id) return row;
          updated = normalizeShowedMePlan({ ...row, ...patch });
          pendingRowsRef.current.set(id, updated);
          return updated;
        });
        return next;
      });
      if (updated) scheduleSave(id, options.immediate);
      return updated;
    },
    [scheduleSave]
  );

  const addPlan = useCallback(
    async (partial = {}) => {
      const id = nextShowedMePlanId(plans);
      const row = normalizeShowedMePlan({
        id,
        goalId: partial.goalId ?? null,
        hookText: '',
        caption: '',
        hashtag: '',
        workflowStatus: WORKFLOW_STATUS_DRAFT,
        status: PLAN_STATUS_NOT_STARTED,
        selectedDemoAssetId: null,
        selectedHookImageId: null,
        selectedHookVideoId: null,
        demoLibraryId: null,
        editorId: partial.editorId ?? null,
        ...partial,
      });
      await upsertShowedMePlan(row);
      setPlans((prev) => [row, ...prev]);
      return row;
    },
    [plans]
  );

  const deletePlan = useCallback(
    async (id) => {
      await deleteShowedMePlanById(id);
      pendingRowsRef.current.delete(id);
      setPlans((prev) => prev.filter((row) => row.id !== id));
    },
    []
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

  return {
    plans,
    loading,
    error,
    reload,
    updatePlan,
    addPlan,
    deletePlan,
    flushPlan,
  };
}

export function ShowedMePlanProvider({ children }) {
  const value = useShowedMePlanState();
  return (
    <ShowedMePlanContext.Provider value={value}>{children}</ShowedMePlanContext.Provider>
  );
}

export function useShowedMePlans() {
  const context = useContext(ShowedMePlanContext);
  if (!context) {
    throw new Error('useShowedMePlans must be used within ShowedMePlanProvider');
  }
  return context;
}
