import { supabase } from './supabase';
import { nextIdFromRows } from './db/helpers';

export function normalizeThisPerson(row) {
  return {
    id: row.id,
    goalId: row.goal_id ?? row.goalId ?? null,
    hookText: row.hook_text ?? row.hookText ?? '',
    caption: row.caption ?? '',
    hashtag: row.hashtag ?? '',
  };
}

function toRow(thisPerson) {
  return {
    id: thisPerson.id,
    goal_id: thisPerson.goalId ?? null,
    hook_text: thisPerson.hookText ?? '',
    caption: thisPerson.caption ?? '',
    hashtag: thisPerson.hashtag ?? '',
  };
}

export async function fetchThisPeople() {
  const { data, error } = await supabase.from('this_people').select('*').order('id');
  if (error) throw error;
  return (data ?? []).map(normalizeThisPerson);
}

export async function upsertThisPerson(thisPerson) {
  const { data, error } = await supabase
    .from('this_people')
    .upsert(toRow(thisPerson))
    .select()
    .single();
  if (error) throw error;
  return normalizeThisPerson(data);
}

export async function upsertThisPeople(thisPeople) {
  if (thisPeople.length === 0) return [];

  const { data, error } = await supabase
    .from('this_people')
    .upsert(thisPeople.map(toRow))
    .select();
  if (error) throw error;
  return (data ?? []).map(normalizeThisPerson);
}

export async function deleteThisPersonById(id) {
  const { error } = await supabase.from('this_people').delete().eq('id', id);
  if (error) throw error;
}

export function nextThisPersonId(thisPeople) {
  return nextIdFromRows(thisPeople);
}
