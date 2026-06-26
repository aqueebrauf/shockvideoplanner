import { useCallback, useState } from 'react';
import baseline from '../data/captions.json';
import {
  loadCaptions,
  nextCaptionId,
  normalizeCaption,
  saveCaptions,
} from '../lib/captionsStorage';

function commit(setCaptions, updater) {
  setCaptions((prev) => {
    const next = updater(prev).map(normalizeCaption);
    saveCaptions(next);
    return next;
  });
}

export function useCaptions() {
  const [captions, setCaptions] = useState(() => loadCaptions(baseline));

  const updateCaption = useCallback((id, patch) => {
    commit(setCaptions, (prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  }, []);

  const addCaption = useCallback(() => {
    commit(setCaptions, (prev) => [
      ...prev,
      {
        id: nextCaptionId(prev),
        style: '',
        structure: '',
        guide: '',
        example: '',
      },
    ]);
  }, []);

  const deleteCaption = useCallback((id) => {
    commit(setCaptions, (prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { captions, updateCaption, addCaption, deleteCaption };
}
