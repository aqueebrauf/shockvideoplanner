import {
  deleteHashtagById,
  fetchHashtags,
  nextHashtagId,
  normalizeHashtag,
  upsertHashtag,
} from '../lib/hashtagsStorage';
import { useRemoteCollection } from './useRemoteCollection';

export function useHashtags() {
  const { items, loading, error, updateItem, addItem, deleteItem } = useRemoteCollection({
    fetchAll: fetchHashtags,
    upsertOne: upsertHashtag,
    deleteById: deleteHashtagById,
    normalize: normalizeHashtag,
    createEmpty: (id) => ({
      id,
      hashtag: '',
      posts: null,
      category: 'broad',
    }),
    getNextId: nextHashtagId,
  });

  return {
    hashtags: items,
    loading,
    error,
    updateHashtag: updateItem,
    addHashtag: addItem,
    deleteHashtag: deleteItem,
  };
}
