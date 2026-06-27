import { normalizeExternalUrl } from './externalUrl';
import { normalizePlanStatus } from './planStatus';
import { supabase } from './supabase';
import { nextIdFromRows } from './db/helpers';

export function normalizeScreen(screen) {
  return {
    name: screen.name ?? '',
    copy: screen.copy ?? '',
  };
}

function readNullableId(value) {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizePlan(row) {
  const hashtagsRaw = row.hashtagsUsed ?? row.hashtags_used;
  const hashtagsUsed = Array.isArray(hashtagsRaw) ? hashtagsRaw : [];

  return {
    id: row.id,
    generatedDate: row.generatedDate ?? row.generated_date ?? '',
    hook: row.hook ?? '',
    characterId: readNullableId(row.characterId ?? row.character_id),
    goalId: readNullableId(row.goalId ?? row.goal_id),
    screenSequenceId: row.screenSequenceId ?? row.screen_sequence_id ?? '',
    captionStyleId: readNullableId(row.captionStyleId ?? row.caption_style_id),
    screens: Array.isArray(row.screens)
      ? row.screens.map(normalizeScreen)
      : [],
    referenceVideoLink: normalizeExternalUrl(
      row.referenceVideoLink ?? row.reference_video_link ?? ''
    ),
    caption: row.caption ?? '',
    captionStyle: row.captionStyle ?? row.caption_style ?? '',
    hashtagsUsed,
    status: normalizePlanStatus(row.status),
  };
}

function toRow(plan) {
  return {
    id: plan.id,
    generated_date: plan.generatedDate,
    hook: plan.hook,
    character_id: plan.characterId,
    goal_id: plan.goalId,
    screen_sequence_id: plan.screenSequenceId || null,
    caption_style_id: plan.captionStyleId,
    screens: plan.screens.map(normalizeScreen),
    reference_video_link: plan.referenceVideoLink,
    caption: plan.caption,
    caption_style: plan.captionStyle ?? '',
    hashtags_used: plan.hashtagsUsed ?? [],
    status: normalizePlanStatus(plan.status),
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
