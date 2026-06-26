import { supabase } from './supabase';
import { nextIdFromRows } from './db/helpers';

export const DEFAULT_CTA_ID = 3;

export function normalizeCta(row) {
  return {
    id: row.id,
    text: row.text ?? '',
  };
}

function toRow(cta) {
  return {
    id: cta.id,
    text: cta.text,
  };
}

export async function fetchCtas() {
  const { data, error } = await supabase.from('ctas').select('*').order('id');
  if (error) throw error;
  return (data ?? []).map(normalizeCta);
}

export async function upsertCta(cta) {
  const { data, error } = await supabase
    .from('ctas')
    .upsert(toRow(cta))
    .select()
    .single();
  if (error) throw error;
  return normalizeCta(data);
}

export async function deleteCtaById(id) {
  const { error } = await supabase.from('ctas').delete().eq('id', id);
  if (error) throw error;
}

export function nextCtaId(ctas) {
  return nextIdFromRows(ctas);
}
