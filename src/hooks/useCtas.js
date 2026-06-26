import {
  deleteCtaById,
  fetchCtas,
  nextCtaId,
  normalizeCta,
  upsertCta,
} from '../lib/ctasStorage';
import { useRemoteCollection } from './useRemoteCollection';

export function useCtas() {
  const { items, loading, error, updateItem, addItem, deleteItem } = useRemoteCollection({
    fetchAll: fetchCtas,
    upsertOne: upsertCta,
    deleteById: deleteCtaById,
    normalize: normalizeCta,
    createEmpty: (id) => ({ id, text: '' }),
    getNextId: nextCtaId,
  });

  return {
    ctas: items,
    loading,
    error,
    updateCta: updateItem,
    addCta: addItem,
    deleteCta: deleteItem,
  };
}
