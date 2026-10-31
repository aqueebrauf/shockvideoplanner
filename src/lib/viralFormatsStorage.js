import { supabase } from './supabase';
import { VIRAL_FORMAT_SEED } from './viralFormatsSeed';

export function emptySide() {
  return {
    hookCopy: '',
    notes: '',
  };
}

function normalizeSide(value) {
  const side = value && typeof value === 'object' ? value : {};
  const notes = [side.hookDescription, side.videoCopy, side.videoDescription, side.notes]
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .join('\n\n');
  return {
    hookCopy: side.hookCopy ?? '',
    notes,
  };
}

function normalizeVideos(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((video, index) => ({
      id: video?.id || `sample-${index + 1}`,
      key: video?.key ?? '',
      url: video?.url ?? '',
      name: video?.name ?? '',
    }))
    .filter((video) => video.url || video.key);
}

function normalizeInstagramLinks(value) {
  if (!Array.isArray(value)) return [];
  return value.map((link, index) => ({
    id: link?.id || `ig-${index + 1}`,
    url: link?.url ?? '',
  }));
}

export function normalizeViralFormat(row) {
  return {
    id: row.id,
    sortOrder: row.sort_order ?? row.sortOrder ?? 0,
    appName: row.app_name ?? row.appName ?? '',
    priority: Boolean(row.priority),
    sampleVideos: normalizeVideos(row.sample_videos ?? row.sampleVideos),
    instagramLinks: normalizeInstagramLinks(row.instagram_links ?? row.instagramLinks),
    original: normalizeSide(row.original),
    smash: normalizeSide(row.smash),
  };
}

function toRow(format) {
  const normalized = normalizeViralFormat(format);
  return {
    id: normalized.id,
    sort_order: normalized.sortOrder,
    app_name: normalized.appName,
    priority: normalized.priority,
    sample_videos: normalized.sampleVideos,
    instagram_links: normalized.instagramLinks,
    original: normalized.original,
    smash: normalized.smash,
    updated_at: new Date().toISOString(),
  };
}

export function formatDisplayName(format) {
  return format.appName?.trim() || 'Untitled format';
}

export function createEmptyViralFormat(id, sortOrder) {
  return normalizeViralFormat({
    id,
    sortOrder,
    appName: '',
    priority: false,
    sampleVideos: [],
    instagramLinks: [],
    original: emptySide(),
    smash: emptySide(),
  });
}

export function nextViralFormatId(formats) {
  if (formats.length === 0) return 1;
  return Math.max(...formats.map((format) => format.id)) + 1;
}

async function seedIfNeeded() {
  const { data: meta, error: metaError } = await supabase
    .from('app_meta')
    .select('value')
    .eq('key', 'viral_formats_seeded')
    .maybeSingle();
  if (metaError) throw metaError;
  if (meta) return;

  const chunkSize = 12;
  for (let index = 0; index < VIRAL_FORMAT_SEED.length; index += chunkSize) {
    const chunk = VIRAL_FORMAT_SEED.slice(index, index + chunkSize).map(toRow);
    const { error } = await supabase.from('viral_formats').upsert(chunk);
    if (error) throw error;
  }

  const { error: flagError } = await supabase.from('app_meta').upsert({
    key: 'viral_formats_seeded',
    value: { count: VIRAL_FORMAT_SEED.length },
  });
  if (flagError) throw flagError;
}

export async function fetchViralFormats() {
  await seedIfNeeded();
  const { data, error } = await supabase
    .from('viral_formats')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(normalizeViralFormat);
}

export async function upsertViralFormat(format) {
  const { data, error } = await supabase
    .from('viral_formats')
    .upsert(toRow(format))
    .select()
    .single();
  if (error) throw error;
  return normalizeViralFormat(data);
}

export async function upsertViralFormatOrder(formats) {
  const { error } = await supabase.from('viral_formats').upsert(formats.map(toRow));
  if (error) throw error;
}

export async function deleteViralFormatById(id) {
  const { error } = await supabase.from('viral_formats').delete().eq('id', id);
  if (error) throw error;
}
