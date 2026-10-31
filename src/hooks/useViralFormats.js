import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createEmptyViralFormat,
  deleteViralFormatById,
  fetchViralFormats,
  nextViralFormatId,
  normalizeViralFormat,
  upsertViralFormat,
  upsertViralFormatOrder,
} from '@/lib/viralFormatsStorage';

const SAVE_DELAY_MS = 500;

function mergeFormat(current, patch) {
  return normalizeViralFormat({
    ...current,
    ...patch,
    original: patch.original ? { ...current.original, ...patch.original } : current.original,
    smash: patch.smash ? { ...current.smash, ...patch.smash } : current.smash,
    sampleVideos: patch.sampleVideos ?? current.sampleVideos,
    instagramLinks: patch.instagramLinks ?? current.instagramLinks,
  });
}

export function useViralFormats() {
  const [formats, setFormats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pendingRef = useRef(new Map());
  const timersRef = useRef(new Map());
  const formatsRef = useRef(formats);
  formatsRef.current = formats;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    pendingRef.current.clear();
  }, []);

  const reload = useCallback(async () => {
    const data = await fetchViralFormats();
    clearTimers();
    setFormats(data);
    return data;
  }, [clearTimers]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchViralFormats()
      .then((data) => {
        if (active) setFormats(data);
      })
      .catch((err) => {
        if (active) setError(err.message ?? 'Failed to load viral formats');
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
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const persist = useCallback(
    async (id) => {
      const row = pendingRef.current.get(id);
      if (!row) return;
      try {
        await upsertViralFormat(row);
        pendingRef.current.delete(id);
        setError(null);
      } catch (err) {
        setError(err.message ?? 'Failed to save');
        await reload();
      }
    },
    [reload]
  );

  const scheduleSave = useCallback(
    (id, immediate = false) => {
      const existing = timersRef.current.get(id);
      if (existing) clearTimeout(existing);
      if (immediate) {
        timersRef.current.delete(id);
        return persist(id);
      }
      timersRef.current.set(
        id,
        setTimeout(() => {
          timersRef.current.delete(id);
          persist(id);
        }, SAVE_DELAY_MS)
      );
    },
    [persist]
  );

  const updateFormat = useCallback(
    (id, patch, immediate = false) => {
      const current = formatsRef.current.find((item) => item.id === id);
      if (!current) return undefined;
      const resolved = typeof patch === 'function' ? patch(current) : patch;
      const updated = mergeFormat(current, resolved);
      pendingRef.current.set(id, updated);
      const next = formatsRef.current.map((item) => (item.id === id ? updated : item));
      formatsRef.current = next;
      setFormats(next);
      return scheduleSave(id, immediate);
    },
    [scheduleSave]
  );

  const addFormat = useCallback(async () => {
    let created = null;
    setFormats((prev) => {
      const sortOrder = prev.length === 0 ? 1 : Math.min(...prev.map((item) => item.sortOrder)) - 1;
      created = createEmptyViralFormat(nextViralFormatId(prev), sortOrder);
      return [created, ...prev];
    });
    try {
      const saved = await upsertViralFormat(created);
      setFormats((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
      setError(null);
      return saved;
    } catch (err) {
      setError(err.message ?? 'Failed to create format');
      await reload();
      return null;
    }
  }, [reload]);

  const removeFormat = useCallback(
    async (id) => {
      const existing = timersRef.current.get(id);
      if (existing) clearTimeout(existing);
      timersRef.current.delete(id);
      pendingRef.current.delete(id);
      setFormats((prev) => prev.filter((item) => item.id !== id));
      try {
        await deleteViralFormatById(id);
        setError(null);
      } catch (err) {
        setError(err.message ?? 'Failed to delete format');
        await reload();
      }
    },
    [reload]
  );

  const reorderFormats = useCallback(
    async (orderedIds) => {
      const byId = new Map(formatsRef.current.map((item) => [item.id, item]));
      const next = orderedIds
        .map((id, index) => {
          const item = byId.get(id);
          if (!item) return null;
          return { ...item, sortOrder: index + 1 };
        })
        .filter(Boolean);
      setFormats(next);

      orderedIds.forEach((id) => {
        const existing = timersRef.current.get(id);
        if (existing) clearTimeout(existing);
        timersRef.current.delete(id);
        const row = next.find((item) => item.id === id);
        if (row) pendingRef.current.set(id, row);
      });

      try {
        await upsertViralFormatOrder(next);
        next.forEach((item) => pendingRef.current.delete(item.id));
        setError(null);
      } catch (err) {
        setError(err.message ?? 'Failed to save order');
        await reload();
      }
    },
    [reload]
  );

  return {
    formats,
    loading,
    error,
    updateFormat,
    addFormat,
    removeFormat,
    reorderFormats,
    reload,
  };
}
