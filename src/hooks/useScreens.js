import { useCallback } from 'react';
import {
  deleteScreenById,
  fetchScreens,
  nextScreenId,
  normalizeScreen,
  upsertScreen,
} from '../lib/screensStorage';
import { uploadScreenImage } from '../lib/screenImageStorage';
import { useRemoteCollection } from './useRemoteCollection';

export function useScreens() {
  const { items, loading, error, updateItem, addItem, deleteItem } = useRemoteCollection({
    fetchAll: fetchScreens,
    upsertOne: upsertScreen,
    deleteById: deleteScreenById,
    normalize: normalizeScreen,
    createEmpty: (id) => ({ id, name: '', image: null, suggestedCopy: '' }),
    getNextId: nextScreenId,
  });

  const updateScreen = useCallback(
    async (id, patch) => {
      let nextPatch = patch;
      if (typeof patch.image === 'string' && patch.image.startsWith('data:')) {
        const url = await uploadScreenImage(id, patch.image);
        nextPatch = { ...patch, image: url };
      }
      await updateItem(id, nextPatch);
    },
    [updateItem]
  );

  return {
    screens: items,
    loading,
    error,
    updateScreen,
    addScreen: addItem,
    deleteScreen: deleteItem,
  };
}
