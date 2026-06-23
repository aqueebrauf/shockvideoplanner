import { useCallback, useMemo, useState } from 'react';
import baseline from '../data/hashtags.json';
import {
  loadOverrides,
  mergeHashtags,
  patchHashtag,
  saveOverrides,
} from '../lib/hashtagsStorage';

export function useHashtags() {
  const [overrides, setOverrides] = useState(loadOverrides);

  const hashtags = useMemo(
    () => mergeHashtags(baseline, overrides),
    [overrides]
  );

  const updateHashtag = useCallback((id, patch) => {
    setOverrides((prev) => {
      const next = patchHashtag(prev, id, patch);
      saveOverrides(next);
      return next;
    });
  }, []);

  return { hashtags, updateHashtag };
}
