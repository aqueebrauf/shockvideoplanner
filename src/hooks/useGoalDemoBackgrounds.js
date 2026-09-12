import { useCallback, useEffect, useState } from 'react';
import {
  deleteGoalDemoBackgroundById,
  fetchGoalDemoBackgrounds,
  nextGoalDemoBackgroundId,
  normalizeGoalDemoBackground,
  upsertGoalDemoBackground,
} from '@/lib/goalDemoBackgroundStorage';

export function useGoalDemoBackgrounds() {
  const [backgrounds, setBackgrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    const data = await fetchGoalDemoBackgrounds();
    setBackgrounds(data);
    return data;
  }, []);

  useEffect(() => {
    let active = true;
    fetchGoalDemoBackgrounds()
      .then((data) => {
        if (active) setBackgrounds(data);
      })
      .catch((err) => {
        if (active) setError(err.message ?? 'Failed to load demo library');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const createBackground = useCallback(
    async (partial) => {
      const id = nextGoalDemoBackgroundId(backgrounds);
      const row = normalizeGoalDemoBackground({
        id,
        goalId: partial.goalId,
        backgroundName: partial.backgroundName ?? '',
      });
      const saved = await upsertGoalDemoBackground(row);
      setBackgrounds((prev) => [...prev, saved]);
      return saved;
    },
    [backgrounds]
  );

  const updateBackground = useCallback(async (id, patch) => {
    const existing = backgrounds.find((row) => row.id === id);
    if (!existing) return null;
    const saved = await upsertGoalDemoBackground(normalizeGoalDemoBackground({ ...existing, ...patch }));
    setBackgrounds((prev) => prev.map((row) => (row.id === id ? saved : row)));
    return saved;
  }, [backgrounds]);

  const removeBackground = useCallback(async (id) => {
    await deleteGoalDemoBackgroundById(id);
    setBackgrounds((prev) => prev.filter((row) => row.id !== id));
  }, []);

  return {
    backgrounds,
    loading,
    error,
    reload,
    createBackground,
    updateBackground,
    removeBackground,
  };
}
