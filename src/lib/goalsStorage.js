import { supabase } from './supabase';
import { nextIdFromRows } from './db/helpers';

export function normalizeGoal(row) {
  return {
    id: row.id,
    title: row.title ?? '',
    link: row.link ?? '',
    date: row.date ?? row.date_label ?? '',
  };
}

function toRow(goal) {
  return {
    id: goal.id,
    title: goal.title,
    link: goal.link,
    date_label: goal.date,
  };
}

export async function fetchGoals() {
  const { data, error } = await supabase.from('goals').select('*').order('id');
  if (error) throw error;
  return (data ?? []).map(normalizeGoal);
}

export async function upsertGoal(goal) {
  const { data, error } = await supabase
    .from('goals')
    .upsert(toRow(goal))
    .select()
    .single();
  if (error) throw error;
  return normalizeGoal(data);
}

export async function deleteGoalById(id) {
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw error;
}

export function nextGoalId(goals) {
  return nextIdFromRows(goals);
}
