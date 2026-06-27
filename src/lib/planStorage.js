import { normalizeExternalUrl } from './externalUrl';
import { supabase } from './supabase';
import { nextIdFromRows } from './db/helpers';

export function normalizeScreen(screen) {
  return {
    name: screen.name ?? '',
    copy: screen.copy ?? '',
  };
}

export function normalizePlan(row) {
  const hashtagsRaw = row.hashtagsUsed ?? row.hashtags_used;
  const hashtagsUsed = Array.isArray(hashtagsRaw) ? hashtagsRaw : [];

  return {
    id: row.id,
    generatedDate: row.generatedDate ?? row.generated_date ?? '',
    hook: row.hook ?? '',
    goalName: row.goalName ?? row.goal_name ?? '',
    screens: Array.isArray(row.screens)
      ? row.screens.map(normalizeScreen)
      : [],
    referenceVideoLink: normalizeExternalUrl(
      row.referenceVideoLink ?? row.reference_video_link ?? ''
    ),
    caption: row.caption ?? '',
    captionStyle: row.captionStyle ?? row.caption_style ?? '',
    hashtagsUsed,
  };
}

function toRow(plan) {
  return {
    id: plan.id,
    generated_date: plan.generatedDate,
    hook: plan.hook,
    goal_name: plan.goalName,
    screens: plan.screens.map(normalizeScreen),
    reference_video_link: plan.referenceVideoLink,
    caption: plan.caption,
    caption_style: plan.captionStyle ?? '',
    hashtags_used: plan.hashtagsUsed ?? [],
  };
}

export async function fetchPlans() {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalizePlan);
}

export async function upsertPlan(plan) {
  const { data, error } = await supabase
    .from('plans')
    .upsert(toRow(plan))
    .select()
    .single();
  if (error) throw error;
  return normalizePlan(data);
}

export async function upsertPlans(plans) {
  if (plans.length === 0) return [];
  const { data, error } = await supabase
    .from('plans')
    .upsert(plans.map(toRow))
    .select();
  if (error) throw error;
  return (data ?? []).map(normalizePlan);
}

export async function deletePlanById(id) {
  const { error } = await supabase.from('plans').delete().eq('id', id);
  if (error) throw error;
}

export function nextPlanId(plan) {
  return nextIdFromRows(plan);
}
