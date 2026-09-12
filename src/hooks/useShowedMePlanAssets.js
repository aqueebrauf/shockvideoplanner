import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchShowedMePlanAssets,
  fetchAllShowedMePlanAssets,
  fetchNextShowedMePlanAssetId,
  upsertShowedMePlanAsset,
  deleteShowedMePlanAssetById,
  normalizeShowedMePlanAsset,
} from '@/lib/showedMePlanAssetStorage';
import { ASSET_STATUS_ACTIVE } from '@/lib/showedMeAssetTypes';

export function useShowedMePlanAssets(planId) {
  const [assets, setAssets] = useState([]);
  const assetsRef = useRef([]);
  const [loading, setLoading] = useState(Boolean(planId));
  const [error, setError] = useState(null);

  const remember = useCallback((next) => {
    assetsRef.current = next;
    setAssets(next);
    return next;
  }, []);

  const reload = useCallback(async () => {
    if (!planId) {
      remember([]);
      return [];
    }
    const data = await fetchShowedMePlanAssets(planId);
    return remember(data);
  }, [planId, remember]);

  useEffect(() => {
    if (!planId) {
      remember([]);
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);
    fetchShowedMePlanAssets(planId)
      .then((data) => {
        if (active) remember(data);
      })
      .catch((err) => {
        if (active) setError(err.message ?? 'Failed to load assets');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [planId, remember]);

  const saveAsset = useCallback(
    async (asset) => {
      const saved = await upsertShowedMePlanAsset(asset);
      const prev = assetsRef.current;
      const idx = prev.findIndex((row) => row.id === saved.id);
      if (idx === -1) {
        remember([...prev, saved]);
      } else {
        const next = [...prev];
        next[idx] = saved;
        remember(next);
      }
      return saved;
    },
    [remember]
  );

  const createAsset = useCallback(
    async (partial) => {
      const id = await fetchNextShowedMePlanAssetId(assetsRef.current);
      const row = normalizeShowedMePlanAsset({
        id,
        planId,
        assetType: partial.assetType,
        storageKey: partial.storageKey ?? '',
        publicUrl: partial.publicUrl ?? '',
        mimeType: partial.mimeType ?? '',
        iteration: partial.iteration ?? 1,
        isSelected: Boolean(partial.isSelected),
        status: ASSET_STATUS_ACTIVE,
        generationParams: partial.generationParams ?? {},
        parentAssetId: partial.parentAssetId ?? null,
      });
      return saveAsset(row);
    },
    [planId, saveAsset]
  );

  const updateAsset = useCallback(
    async (id, patch) => {
      const existing = assetsRef.current.find((row) => row.id === id);
      if (!existing) return null;
      return saveAsset(normalizeShowedMePlanAsset({ ...existing, ...patch }));
    },
    [saveAsset]
  );

  const removeAsset = useCallback(
    async (id) => {
      await deleteShowedMePlanAssetById(id);
      remember(assetsRef.current.filter((row) => row.id !== id));
    },
    [remember]
  );

  return {
    assets,
    loading,
    error,
    reload,
    saveAsset,
    createAsset,
    updateAsset,
    removeAsset,
  };
}

export function useAllShowedMePlanAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    const data = await fetchAllShowedMePlanAssets();
    setAssets(data);
    return data;
  }, []);

  useEffect(() => {
    let active = true;
    fetchAllShowedMePlanAssets()
      .then((data) => {
        if (active) setAssets(data);
      })
      .catch((err) => {
        if (active) setError(err.message ?? 'Failed to load assets');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { assets, loading, error, reload };
}
