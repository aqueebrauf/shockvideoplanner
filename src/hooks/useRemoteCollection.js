import { useCallback, useEffect, useState } from 'react';

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

  const reload = useCallback(async () => {
    const data = await fetchAll();
    setItems(data);
    return data;
  }, [fetchAll]);

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

  const updateItem = useCallback(
    async (id, patch) => {
      let updated = null;
      setItems((prev) => {
        const next = prev.map((item) => {
          if (item.id !== id) return item;
          updated = normalize({ ...item, ...patch });
          return updated;
        });
        return next;
      });

      if (!updated) return;

      try {
        await upsertOne(updated);
        setError(null);
      } catch (err) {
        setError(err.message ?? 'Failed to save');
        await reload();
      }
    },
    [normalize, upsertOne, reload]
  );

  const addItem = useCallback(async () => {
    let created = null;
    setItems((prev) => {
      created = createEmpty(getNextId(prev));
      return [...prev, created];
    });

    try {
      await upsertOne(created);
      setError(null);
    } catch (err) {
      setError(err.message ?? 'Failed to add row');
      await reload();
    }
  }, [createEmpty, getNextId, upsertOne, reload]);

  const deleteItem = useCallback(
    async (id) => {
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

  return { items, loading, error, updateItem, addItem, deleteItem, reload };
}
