import { supabase } from './supabase';
import { nextIdFromRows } from './db/helpers';
import {
  ASSET_STATUS_ACTIVE,
  ASSET_STATUS_DELETED,
  ASSET_STATUS_GENERATING,
  isSingleSlotAssetType,
} from './showedMeAssetTypes';

function normalizeAssetStatus(value) {
  if (value === ASSET_STATUS_DELETED) return ASSET_STATUS_DELETED;
  if (value === ASSET_STATUS_GENERATING) return ASSET_STATUS_GENERATING;
  return ASSET_STATUS_ACTIVE;
}

export function normalizeShowedMePlanAsset(row) {
  return {
    id: row.id,
    planId: row.plan_id ?? row.planId,
    assetType: row.asset_type ?? row.assetType ?? '',
    storageKey: row.storage_key ?? row.storageKey ?? '',
    publicUrl: row.public_url ?? row.publicUrl ?? '',
    mimeType: row.mime_type ?? row.mimeType ?? '',
    iteration: row.iteration ?? 1,
    isSelected: Boolean(row.is_selected ?? row.isSelected),
    status: normalizeAssetStatus(row.status),
    generationParams: row.generation_params ?? row.generationParams ?? {},
    parentAssetId: row.parent_asset_id ?? row.parentAssetId ?? null,
    updatedAt: row.updated_at ?? row.updatedAt ?? null,
  };
}

function toRow(asset) {
  return {
    id: asset.id,
    plan_id: asset.planId,
    asset_type: asset.assetType,
    storage_key: asset.storageKey ?? '',
    public_url: asset.publicUrl ?? '',
    mime_type: asset.mimeType ?? '',
    iteration: asset.iteration ?? 1,
    is_selected: Boolean(asset.isSelected),
    status: normalizeAssetStatus(asset.status),
    generation_params: asset.generationParams ?? {},
    parent_asset_id: asset.parentAssetId ?? null,
  };
}

export async function fetchShowedMePlanAssets(planId) {
  const { data, error } = await supabase
    .from('showed_me_plan_assets')
    .select('*')
    .eq('plan_id', planId)
    .order('asset_type')
    .order('iteration', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalizeShowedMePlanAsset);
}

export async function fetchAllShowedMePlanAssets() {
  const { data, error } = await supabase
    .from('showed_me_plan_assets')
    .select('*')
    .order('plan_id')
    .order('asset_type')
    .order('iteration', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalizeShowedMePlanAsset);
}

export async function upsertShowedMePlanAsset(asset) {
  const { data, error } = await supabase
    .from('showed_me_plan_assets')
    .upsert(toRow(asset))
    .select()
    .single();
  if (error) throw error;
  return normalizeShowedMePlanAsset(data);
}

export async function upsertShowedMePlanAssets(assets) {
  if (assets.length === 0) return [];
  const { data, error } = await supabase
    .from('showed_me_plan_assets')
    .upsert(assets.map(toRow))
    .select();
  if (error) throw error;
  return (data ?? []).map(normalizeShowedMePlanAsset);
}

export async function deleteShowedMePlanAssetById(id) {
  const { error } = await supabase.from('showed_me_plan_assets').delete().eq('id', id);
  if (error) throw error;
}

export function nextShowedMePlanAssetId(assets) {
  return nextIdFromRows(assets);
}

export async function fetchNextShowedMePlanAssetId(localRows = []) {
  const { data, error } = await supabase
    .from('showed_me_plan_assets')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  const localMax = localRows.reduce((max, row) => Math.max(max, row.id ?? 0), 0);
  return Math.max(data?.id ?? 0, localMax) + 1;
}

export function filterActiveAssets(assets) {
  return assets.filter((asset) => asset.status === ASSET_STATUS_ACTIVE);
}

export function assetsByType(assets, assetType) {
  return filterActiveAssets(assets).filter((asset) => asset.assetType === assetType);
}

export function nextIterationForType(assets, assetType) {
  const matching = assetsByType(assets, assetType);
  if (matching.length === 0) return 1;
  return Math.max(...matching.map((asset) => asset.iteration)) + 1;
}

export function getActiveAssetForType(assets, assetType) {
  const matching = assetsByType(assets, assetType);
  if (matching.length === 0) return null;
  return matching.reduce((best, row) => (row.iteration >= best.iteration ? row : best));
}

export function iterationForUpload(assets, assetType) {
  if (isSingleSlotAssetType(assetType)) return 1;
  return nextIterationForType(assets, assetType);
}

/** If legacy data has duplicates for a single-slot type, pick one keeper. */
export function assetHasFile(asset) {
  return Boolean(asset?.publicUrl?.trim() || asset?.storageKey?.trim());
}

export function getActivePlanAsset(assets, planId, assetType, preferredId = null) {
  const matching = filterActiveAssets(assets).filter(
    (asset) => asset.planId === planId && asset.assetType === assetType
  );
  if (matching.length === 0) return null;
  if (preferredId != null) {
    const preferred = matching.find((asset) => asset.id === preferredId);
    if (preferred) return preferred;
  }
  return matching.reduce((best, row) => (row.iteration >= best.iteration ? row : best));
}

export function pickSingleSlotKeeper(assets, assetType, selectedId = null) {
  const matching = assetsByType(assets, assetType);
  if (matching.length === 0) return { keeper: null, orphans: [] };
  if (matching.length === 1) return { keeper: matching[0], orphans: [] };

  const bySelected = selectedId
    ? matching.find((row) => row.id === selectedId)
    : null;
  const keeper =
    bySelected ??
    matching.find((row) => row.isSelected) ??
    matching.reduce((best, row) => (row.iteration >= best.iteration ? row : best));

  return {
    keeper,
    orphans: matching.filter((row) => row.id !== keeper.id),
  };
}
