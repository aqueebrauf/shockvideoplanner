import { useCallback, useState } from 'react';
import baseline from '../data/hashtags.json';
import {
  loadHashtags,
  nextHashtagId,
  normalizeHashtag,
  saveHashtags,
} from '../lib/hashtagsStorage';

function commit(setHashtags, updater) {
  setHashtags((prev) => {
    const next = updater(prev).map(normalizeHashtag);
    saveHashtags(next);
    return next;
  });
}

export function useHashtags() {
  const [hashtags, setHashtags] = useState(() => loadHashtags(baseline));

  const updateHashtag = useCallback((id, patch) => {
    commit(setHashtags, (prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...patch } : h))
    );
  }, []);

  const addHashtag = useCallback(() => {
    commit(setHashtags, (prev) => [
      ...prev,
      {
        id: nextHashtagId(prev),
        hashtag: '',
        posts: null,
        category: 'broad',
        notes: '',
      },
    ]);
  }, []);

  const deleteHashtag = useCallback((id) => {
    commit(setHashtags, (prev) => prev.filter((h) => h.id !== id));
  }, []);

  return { hashtags, updateHashtag, addHashtag, deleteHashtag };
}
