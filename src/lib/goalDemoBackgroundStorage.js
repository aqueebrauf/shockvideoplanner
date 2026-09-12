import { supabase } from './supabase';
import { nextIdFromRows } from './db/helpers';

export function normalizeGoalDemoBackground(row) {
  return {
    id: row.id,
    goalId: row.goal_id ?? row.goalId,
    backgroundName: row.background_name ?? row.backgroundName ?? '',
    demoStorageKey: row.demo_storage_key ?? row.demoStorageKey ?? '',
    demoPublicUrl: row.demo_public_url ?? row.demoPublicUrl ?? '',
    demoMimeType: row.demo_mime_type ?? row.demoMimeType ?? '',
    frameStorageKey: row.frame_storage_key ?? row.frameStorageKey ?? '',
    framePublicUrl: row.frame_public_url ?? row.framePublicUrl ?? '',
    frameMimeType: row.frame_mime_type ?? row.frameMimeType ?? 'image/jpeg',
    updatedAt: row.updated_at ?? row.updatedAt ?? null,
  };
}

function toRow(entry) {
  return {
    id: entry.id,
    goal_id: entry.goalId,
    background_name: entry.backgroundName ?? '',
    demo_storage_key: entry.demoStorageKey ?? '',
    demo_public_url: entry.demoPublicUrl ?? '',
    demo_mime_type: entry.demoMimeType ?? '',
    frame_storage_key: entry.frameStorageKey ?? '',
    frame_public_url: entry.framePublicUrl ?? '',
    frame_mime_type: entry.frameMimeType ?? 'image/jpeg',
  };
}

export async function fetchGoalDemoBackgrounds() {
  const { data, error } = await supabase
    .from('goal_demo_backgrounds')
    .select('*')
    .order('goal_id')
    .order('id');
  if (error) throw error;
  return (data ?? []).map(normalizeGoalDemoBackground);
}

export async function fetchGoalDemoBackgroundsByGoalId(goalId) {
  const { data, error } = await supabase
    .from('goal_demo_backgrounds')
    .select('*')
    .eq('goal_id', goalId)
    .order('id');
  if (error) throw error;
  return (data ?? []).map(normalizeGoalDemoBackground);
}

export async function upsertGoalDemoBackground(entry) {
  const { data, error } = await supabase
    .from('goal_demo_backgrounds')
    .upsert(toRow(entry))
    .select()
    .single();
  if (error) throw error;
  return normalizeGoalDemoBackground(data);
}

export async function deleteGoalDemoBackgroundById(id) {
  const { error } = await supabase.from('goal_demo_backgrounds').delete().eq('id', id);
  if (error) throw error;
}

export function nextGoalDemoBackgroundId(rows) {
  return nextIdFromRows(rows);
}

export async function fetchNextGoalDemoBackgroundId(localRows = []) {
  const { data, error } = await supabase
    .from('goal_demo_backgrounds')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  const localMax = localRows.reduce((max, row) => Math.max(max, row.id ?? 0), 0);
  return Math.max(data?.id ?? 0, localMax) + 1;
}

export function groupBackgroundsByGoalId(backgrounds, goals) {
  const goalTitleById = new Map(goals.map((goal) => [goal.id, goal.title?.trim() || `Goal ${goal.id}`]));
  const groups = new Map();

  for (const entry of backgrounds) {
    if (!groups.has(entry.goalId)) {
      groups.set(entry.goalId, {
        goalId: entry.goalId,
        goalTitle: goalTitleById.get(entry.goalId) ?? `Goal ${entry.goalId}`,
        entries: [],
      });
    }
    groups.get(entry.goalId).entries.push(entry);
  }

  return [...groups.values()].sort((a, b) => a.goalId - b.goalId);
}

export function libraryEntryHasFiles(entry) {
  return Boolean(entry?.demoPublicUrl?.trim());
}

export function nextDefaultBackgroundName(backgrounds, goalId) {
  const forGoal = backgrounds.filter((row) => row.goalId === goalId);
  let max = 0;
  for (const row of forGoal) {
    const match = /^Background(\d+)$/i.exec((row.backgroundName ?? '').trim());
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `Background${Math.max(max, forGoal.length) + 1}`;
}

export function goalDisplayName(goals, goalId) {
  const goal = goals.find((row) => row.id === goalId);
  return goal?.title?.trim() || `Goal ${goalId}`;
}
