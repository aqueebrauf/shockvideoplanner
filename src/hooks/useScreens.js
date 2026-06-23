import { useCallback, useMemo, useState } from 'react';
import baseline from '../data/screens.json';
import {
  loadOverrides,
  mergeScreens,
  patchScreen,
  saveOverrides,
} from '../lib/screensStorage';

export function useScreens() {
  const [overrides, setOverrides] = useState(loadOverrides);

  const screens = useMemo(
    () => mergeScreens(baseline, overrides),
    [overrides]
  );

  const updateScreen = useCallback((id, patch) => {
    setOverrides((prev) => {
      const next = patchScreen(prev, id, patch);
      saveOverrides(next);
      return next;
    });
  }, []);

  return { screens, updateScreen };
}
