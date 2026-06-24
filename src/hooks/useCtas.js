import { useCallback, useState } from 'react';
import baseline from '../data/ctas.json';
import {
  loadCtas,
  nextCtaId,
  normalizeCta,
  saveCtas,
} from '../lib/ctasStorage';

function commit(setCtas, updater) {
  setCtas((prev) => {
    const next = updater(prev).map(normalizeCta);
    saveCtas(next);
    return next;
  });
}

export function useCtas() {
  const [ctas, setCtas] = useState(() => loadCtas(baseline));

  const updateCta = useCallback((id, patch) => {
    commit(setCtas, (prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  }, []);

  const addCta = useCallback(() => {
    commit(setCtas, (prev) => [
      ...prev,
      { id: nextCtaId(prev), text: '' },
    ]);
  }, []);

  const deleteCta = useCallback((id) => {
    commit(setCtas, (prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { ctas, updateCta, addCta, deleteCta };
}
