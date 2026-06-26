import {
  deleteCaptionById,
  fetchCaptions,
  nextCaptionId,
  normalizeCaption,
  upsertCaption,
} from '../lib/captionsStorage';
import { useRemoteCollection } from './useRemoteCollection';

export function useCaptions() {
  const { items, loading, error, updateItem, addItem, deleteItem } = useRemoteCollection({
    fetchAll: fetchCaptions,
    upsertOne: upsertCaption,
    deleteById: deleteCaptionById,
    normalize: normalizeCaption,
    createEmpty: (id) => ({
      id,
      style: '',
      structure: '',
      guide: '',
      example: '',
    }),
    getNextId: nextCaptionId,
  });

  return {
    captions: items,
    loading,
    error,
    updateCaption: updateItem,
    addCaption: addItem,
    deleteCaption: deleteItem,
  };
}
