import { supabase } from './supabase';
import { nextIdFromRows } from './db/helpers';
import { normalizePlanStatus } from './planStatus';
import { WORKFLOW_STATUS_DRAFT, WORKFLOW_STATUS_READY } from './personVideoAssetTypes';

export function normalizeWorkflowStatus(value) {
  if (value === WORKFLOW_STATUS_READY) return WORKFLOW_STATUS_READY;
  return WORKFLOW_STATUS_DRAFT;
}

export function normalizePersonVideoPlan(row) {
  return {
    id: row.id,
    goalId: row.goal_id ?? row.goalId ?? null,
    hookText: row.hook_text ?? row.hookText ?? '',
    caption: row.caption ?? '',
    hashtag: row.hashtag ?? '',
    workflowStatus: normalizeWorkflowStatus(row.workflow_status ?? row.workflowStatus),
    status: normalizePlanStatus(row.status),
    selectedDemoAssetId: row.selected_demo_asset_id ?? row.selectedDemoAssetId ?? null,
    selectedHookImageId: row.selected_hook_image_id ?? row.selectedHookImageId ?? null,
    selectedHookVideoId: row.selected_hook_video_id ?? row.selectedHookVideoId ?? null,
    updatedAt: row.updated_at ?? row.updatedAt ?? null,
  };
}

function toRow(plan) {
  return {
    id: plan.id,
    goal_id: plan.goalId ?? null,
    hook_text: plan.hookText ?? '',
    caption: plan.caption ?? '',
    hashtag: plan.hashtag ?? '',
    workflow_status: normalizeWorkflowStatus(plan.workflowStatus),
    status: normalizePlanStatus(plan.status),
    selected_demo_asset_id: plan.selectedDemoAssetId ?? null,
    selected_hook_image_id: plan.selectedHookImageId ?? null,
    selected_hook_video_id: plan.selectedHookVideoId ?? null,
  };
}

export async function fetchPersonVideoPlans() {
  const { data, error } = await supabase
    .from('person_video_plans')
    .select('*')
    .order('id', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalizePersonVideoPlan);
}

export async function fetchPersonVideoPlanById(id) {
  const { data, error } = await supabase
    .from('person_video_plans')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizePersonVideoPlan(data) : null;
}

export async function upsertPersonVideoPlan(plan) {
  const { data, error } = await supabase
    .from('person_video_plans')
    .upsert(toRow(plan))
    .select()
    .single();
  if (error) throw error;
  return normalizePersonVideoPlan(data);
}

export async function deletePersonVideoPlanById(id) {
  const { error } = await supabase.from('person_video_plans').delete().eq('id', id);
  if (error) throw error;
}

export function nextPersonVideoPlanId(plans) {
  return nextIdFromRows(plans);
}
