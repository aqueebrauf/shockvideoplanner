import { supabase } from './supabase';

export function normalizeScreenSequence(row) {
  return {
    id: row.id,
    name: row.name ?? '',
    screenIds: Array.isArray(row.screen_ids) ? row.screen_ids : [],
  };
}

export async function fetchScreenSequences() {
  const { data, error } = await supabase.from('screen_sequences').select('*').order('id');
  if (error) throw error;
  return (data ?? []).map(normalizeScreenSequence);
}
