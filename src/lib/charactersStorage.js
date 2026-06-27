import { supabase } from './supabase';
import { nextIdFromRows } from './db/helpers';

export function normalizeCharacter(row) {
  return {
    id: row.id,
    name: row.name ?? '',
  };
}

function toRow(character) {
  return {
    id: character.id,
    name: character.name,
  };
}

export async function fetchCharacters() {
  const { data, error } = await supabase.from('characters').select('*').order('id');
  if (error) throw error;
  return (data ?? []).map(normalizeCharacter);
}

export async function upsertCharacter(character) {
  const { data, error } = await supabase
    .from('characters')
    .upsert(toRow(character))
    .select()
    .single();
  if (error) throw error;
  return normalizeCharacter(data);
}

export async function deleteCharacterById(id) {
  const { error } = await supabase.from('characters').delete().eq('id', id);
  if (error) throw error;
}

export function nextCharacterId(characters) {
  return nextIdFromRows(characters);
}
