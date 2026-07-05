import { supabase } from './supabase';
import { nextIdFromRows } from './db/helpers';
import { normalizeVerbatimStatus, VERBATIM_STATUS } from './verbatimStatus';

export function normalizeVerbatim(row) {
  return {
    id: row.id,
    text: row.text ?? '',
    status: normalizeVerbatimStatus(row.status),
  };
}

function toRow(verbatim) {
  return {
    id: verbatim.id,
    text: verbatim.text,
    status: normalizeVerbatimStatus(verbatim.status ?? VERBATIM_STATUS.NOT_STARTED),
  };
}

export async function fetchVerbatims() {
  const { data, error } = await supabase.from('verbatims').select('*').order('id');
  if (error) throw error;
  return (data ?? []).map(normalizeVerbatim);
}

export async function upsertVerbatim(verbatim) {
  const { data, error } = await supabase
    .from('verbatims')
    .upsert(toRow(verbatim))
    .select()
    .single();
  if (error) throw error;
  return normalizeVerbatim(data);
}

export async function deleteVerbatimById(id) {
  const { error } = await supabase.from('verbatims').delete().eq('id', id);
  if (error) throw error;
}

export function nextVerbatimId(verbatims) {
  return nextIdFromRows(verbatims);
}
