import { useCallback, useEffect, useState } from 'react';
import {
  fetchShowedMePlanAssets,
  fetchAllShowedMePlanAssets,
  upsertShowedMePlanAsset,
  deleteShowedMePlanAssetById,
  nextShowedMePlanAssetId,
  normalizeShowedMePlanAsset,
} from '@/lib/showedMePlanAssetStorage';
import { ASSET_STATUS_ACTIVE } from '@/lib/showedMeAssetTypes';

export function useShowedMePlanAssets(planId) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(Boolean(planId));
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!planId) {
      setAssets([]);
      return [];
    }
    const data = await fetchShowedMePlanAssets(planId);
    setAssets(data);
    return data;
  }, [planId]);

  useEffect(() => {
    if (!planId) {
      setAssets([]);
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);
    fetchShowedMePlanAssets(planId)
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
  }, [planId]);

  const saveAsset = useCallback(
    async (asset) => {
      const saved = await upsertShowedMePlanAsset(asset);
      setAssets((prev) => {
        const idx = prev.findIndex((row) => row.id === saved.id);
        if (idx === -1) return [...prev, saved];
        const next = [...prev];
        next[idx] = saved;
        return next;
      });
      return saved;
    },
    []
  );

  const createAsset = useCallback(
    async (partial) => {
      const id = nextShowedMePlanAssetId(assets);
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
    [assets, planId, saveAsset]
  );

  const updateAsset = useCallback(
    async (id, patch) => {
      const existing = assets.find((row) => row.id === id);
      if (!existing) return null;
      return saveAsset(normalizeShowedMePlanAsset({ ...existing, ...patch }));
    },
    [assets, saveAsset]
  );

  const removeAsset = useCallback(async (id) => {
    await deleteShowedMePlanAssetById(id);
    setAssets((prev) => prev.filter((row) => row.id !== id));
  }, []);

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
