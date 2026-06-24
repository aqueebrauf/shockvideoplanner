import { useCallback, useState } from 'react';
import baseline from '../data/screens.json';
import {
  loadScreens,
  nextScreenId,
  normalizeScreen,
  saveScreens,
} from '../lib/screensStorage';

function commit(setScreens, updater) {
  setScreens((prev) => {
    const next = updater(prev).map(normalizeScreen);
    saveScreens(next);
    return next;
  });
}

export function useScreens() {
  const [screens, setScreens] = useState(() => loadScreens(baseline));

  const updateScreen = useCallback((id, patch) => {
    commit(setScreens, (prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  }, []);

  const addScreen = useCallback(() => {
    commit(setScreens, (prev) => [
      ...prev,
      { id: nextScreenId(prev), name: '', image: null, suggestedCopy: '' },
    ]);
  }, []);

  const deleteScreen = useCallback((id) => {
    commit(setScreens, (prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { screens, updateScreen, addScreen, deleteScreen };
}
