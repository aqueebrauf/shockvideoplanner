import {
  deleteCharacterById,
  fetchCharacters,
  nextCharacterId,
  normalizeCharacter,
  upsertCharacter,
} from '../lib/charactersStorage';
import { useRemoteCollection } from './useRemoteCollection';

export function useCharacters() {
  const { items, loading, error, updateItem, addItem, deleteItem } = useRemoteCollection({
    fetchAll: fetchCharacters,
    upsertOne: upsertCharacter,
    deleteById: deleteCharacterById,
    normalize: normalizeCharacter,
    createEmpty: (id) => ({ id, name: '' }),
    getNextId: nextCharacterId,
  });

  return {
    characters: items,
    loading,
    error,
    updateCharacter: updateItem,
    addCharacter: addItem,
    deleteCharacter: deleteItem,
  };
}
