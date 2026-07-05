import { useCallback, useEffect, useRef, useState } from 'react';

const SAVE_DELAY_MS = 500;

export function useRemoteCollection({
  fetchAll,
  upsertOne,
  deleteById,
  normalize,
  createEmpty,
  getNextId,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pendingRowsRef = useRef(new Map());
  const saveTimersRef = useRef(new Map());

  const clearPendingSaves = useCallback(() => {
    saveTimersRef.current.forEach((timer) => clearTimeout(timer));
    saveTimersRef.current.clear();
    pendingRowsRef.current.clear();
  }, []);

  const reload = useCallback(async () => {
    const data = await fetchAll();
    clearPendingSaves();
    setItems(data);
    return data;
  }, [fetchAll, clearPendingSaves]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAll()
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((err) => {
        if (active) setError(err.message ?? 'Failed to load data');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchAll]);

  useEffect(() => {
    return () => {
      saveTimersRef.current.forEach((timer) => clearTimeout(timer));
      saveTimersRef.current.clear();
    };
  }, []);

  const persistItem = useCallback(
    async (id) => {
      const row = pendingRowsRef.current.get(id);
      if (!row) return;

      try {
        await upsertOne(row);
        pendingRowsRef.current.delete(id);
        setError(null);
      } catch (err) {
        setError(err.message ?? 'Failed to save');
        await reload();
      }
    },
    [upsertOne, reload]
  );

  const scheduleSave = useCallback(
    (id, immediate = false) => {
      const existing = saveTimersRef.current.get(id);
      if (existing) clearTimeout(existing);

      if (immediate) {
        saveTimersRef.current.delete(id);
        return persistItem(id);
      }

      saveTimersRef.current.set(
        id,
        setTimeout(() => {
          saveTimersRef.current.delete(id);
          persistItem(id);
        }, SAVE_DELAY_MS)
      );
    },
    [persistItem]
  );

  const updateItem = useCallback(
    (id, patch) => {
      let updated = null;
      setItems((prev) => {
        const next = prev.map((item) => {
          if (item.id !== id) return item;
          updated = normalize({ ...item, ...patch });
          pendingRowsRef.current.set(id, updated);
          return updated;
        });
        return next;
      });

      if (!updated) return;

      scheduleSave(id);
    },
    [normalize, scheduleSave]
  );

  const flushItem = useCallback(
    (id) => {
      const existing = saveTimersRef.current.get(id);
      if (existing) clearTimeout(existing);
      saveTimersRef.current.delete(id);
      return persistItem(id);
    },
    [persistItem]
  );

  const addItem = useCallback(() => {
    let created = null;
    setItems((prev) => {
      created = normalize(createEmpty(getNextId(prev)));
      pendingRowsRef.current.set(created.id, created);
      return [...prev, created];
    });

    scheduleSave(created.id);
  }, [createEmpty, getNextId, normalize, scheduleSave]);

  const deleteItem = useCallback(
    async (id) => {
      const existing = saveTimersRef.current.get(id);
      if (existing) clearTimeout(existing);
      saveTimersRef.current.delete(id);
      pendingRowsRef.current.delete(id);

      setItems((prev) => prev.filter((item) => item.id !== id));

      try {
        await deleteById(id);
        setError(null);
      } catch (err) {
        setError(err.message ?? 'Failed to delete');
        await reload();
      }
    },
    [deleteById, reload]
  );

  return {
    items,
    loading,
    error,
    updateItem,
    addItem,
    deleteItem,
    flushItem,
    reload,
  };
}
