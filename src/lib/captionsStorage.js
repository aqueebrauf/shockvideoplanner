import { supabase } from './supabase';
import { nextIdFromRows } from './db/helpers';

export function normalizeCaption(row) {
  return {
    id: row.id,
    style: row.style ?? '',
    structure: row.structure ?? '',
    guide: row.guide ?? '',
    example: row.example ?? '',
  };
}

function toRow(caption) {
  return {
    id: caption.id,
    style: caption.style,
    structure: caption.structure,
    guide: caption.guide,
    example: caption.example,
  };
}

export async function fetchCaptions() {
  const { data, error } = await supabase.from('captions').select('*').order('id');
  if (error) throw error;
  return (data ?? []).map(normalizeCaption);
}

export async function upsertCaption(caption) {
  const { data, error } = await supabase
    .from('captions')
    .upsert(toRow(caption))
    .select()
    .single();
  if (error) throw error;
  return normalizeCaption(data);
}

export async function deleteCaptionById(id) {
  const { error } = await supabase.from('captions').delete().eq('id', id);
  if (error) throw error;
}

export function nextCaptionId(captions) {
  return nextIdFromRows(captions);
}
