import { useCallback, useEffect, useRef, useState } from 'react';
import {
  deleteGoalDemoBackgroundById,
  fetchGoalDemoBackgrounds,
  fetchNextGoalDemoBackgroundId,
  normalizeGoalDemoBackground,
  upsertGoalDemoBackground,
} from '@/lib/goalDemoBackgroundStorage';

export function useGoalDemoBackgrounds() {
  const [backgrounds, setBackgrounds] = useState([]);
  const backgroundsRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const remember = useCallback((next) => {
    backgroundsRef.current = next;
    setBackgrounds(next);
    return next;
  }, []);

  const reload = useCallback(async () => {
    const data = await fetchGoalDemoBackgrounds();
    return remember(data);
  }, [remember]);

  useEffect(() => {
    let active = true;
    fetchGoalDemoBackgrounds()
      .then((data) => {
        if (active) remember(data);
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
  }, [remember]);

  const createBackground = useCallback(
    async (partial) => {
      const id = await fetchNextGoalDemoBackgroundId(backgroundsRef.current);
      const row = normalizeGoalDemoBackground({
        id,
        goalId: partial.goalId,
        backgroundName: partial.backgroundName ?? '',
        demoStorageKey: partial.demoStorageKey,
        demoPublicUrl: partial.demoPublicUrl,
        demoMimeType: partial.demoMimeType,
        frameStorageKey: partial.frameStorageKey,
        framePublicUrl: partial.framePublicUrl,
        frameMimeType: partial.frameMimeType,
      });
      const saved = await upsertGoalDemoBackground(row);
      remember([...backgroundsRef.current, saved]);
      return saved;
    },
    [remember]
  );

  const updateBackground = useCallback(
    async (id, patch) => {
      const existing = backgroundsRef.current.find((row) => row.id === id);
      if (!existing) {
        throw new Error('Demo library entry was not found. Try uploading again.');
      }
      const saved = await upsertGoalDemoBackground(
        normalizeGoalDemoBackground({ ...existing, ...patch })
      );
      remember(backgroundsRef.current.map((row) => (row.id === id ? saved : row)));
      return saved;
    },
    [remember]
  );

  const removeBackground = useCallback(
    async (id) => {
      await deleteGoalDemoBackgroundById(id);
      remember(backgroundsRef.current.filter((row) => row.id !== id));
    },
    [remember]
  );

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
