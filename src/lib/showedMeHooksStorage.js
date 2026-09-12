import { supabase } from './supabase';
import { nextIdFromRows } from './db/helpers';

export function normalizeShowedMeHook(row) {
  return {
    id: row.id,
    goalId: row.goal_id ?? row.goalId ?? null,
    text: row.text ?? '',
  };
}

function toRow(hook) {
  return {
    id: hook.id,
    goal_id: hook.goalId ?? null,
    text: hook.text ?? '',
  };
}

export async function fetchShowedMeHooks() {
  const { data, error } = await supabase.from('showed_me_hooks').select('*').order('id');
  if (error) throw error;
  return (data ?? []).map(normalizeShowedMeHook);
}

export async function upsertShowedMeHook(hook) {
  const { data, error } = await supabase
    .from('showed_me_hooks')
    .upsert(toRow(hook))
    .select()
    .single();
  if (error) throw error;
  return normalizeShowedMeHook(data);
}

export async function deleteShowedMeHookById(id) {
  const { error } = await supabase.from('showed_me_hooks').delete().eq('id', id);
  if (error) throw error;
}

export function nextShowedMeHookId(hooks) {
  return nextIdFromRows(hooks);
}
