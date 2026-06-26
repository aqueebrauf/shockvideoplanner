import { supabase } from './supabase';
import { nextIdFromRows } from './db/helpers';

export function normalizeScreen(row) {
  return {
    id: row.id,
    name: row.name ?? '',
    image: row.image ?? row.image_url ?? null,
    suggestedCopy: row.suggestedCopy ?? row.suggested_copy ?? '',
  };
}

function toRow(screen) {
  return {
    id: screen.id,
    name: screen.name,
    image_url: screen.image,
    suggested_copy: screen.suggestedCopy,
  };
}

export async function fetchScreens() {
  const { data, error } = await supabase.from('screens').select('*').order('id');
  if (error) throw error;
  return (data ?? []).map(normalizeScreen);
}

export async function upsertScreen(screen) {
  const { data, error } = await supabase
    .from('screens')
    .upsert(toRow(screen))
    .select()
    .single();
  if (error) throw error;
  return normalizeScreen(data);
}

export async function deleteScreenById(id) {
  const { error } = await supabase.from('screens').delete().eq('id', id);
  if (error) throw error;
}

export function nextScreenId(screens) {
  return nextIdFromRows(screens);
}
