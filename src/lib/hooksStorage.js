import { supabase } from './supabase';
import { nextIdFromRows } from './db/helpers';

export function normalizeHook(row) {
  return {
    id: row.id,
    text: row.text ?? '',
    verbatimId: row.verbatim_id ?? row.verbatimId ?? null,
  };
}

function toRow(hook) {
  return {
    id: hook.id,
    text: hook.text,
    verbatim_id: hook.verbatimId ?? null,
  };
}

export async function fetchHooks() {
  const { data, error } = await supabase.from('hooks').select('*').order('id');
  if (error) throw error;
  return (data ?? []).map(normalizeHook);
}

export async function upsertHook(hook) {
  const { data, error } = await supabase
    .from('hooks')
    .upsert(toRow(hook))
    .select()
    .single();
  if (error) throw error;
  return normalizeHook(data);
}

export async function deleteHookById(id) {
  const { error } = await supabase.from('hooks').delete().eq('id', id);
  if (error) throw error;
}

export function nextHookId(hooks) {
  return nextIdFromRows(hooks);
}
