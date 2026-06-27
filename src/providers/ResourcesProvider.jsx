import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRemoteCollection } from '@/hooks/useRemoteCollection';
import {
  deleteCharacterById,
  fetchCharacters,
  nextCharacterId,
  normalizeCharacter,
  upsertCharacter,
} from '@/lib/charactersStorage';
import {
  deleteCaptionById,
  fetchCaptions,
  nextCaptionId,
  normalizeCaption,
  upsertCaption,
} from '@/lib/captionsStorage';
import {
  deleteCtaById,
  fetchCtas,
  nextCtaId,
  normalizeCta,
  upsertCta,
} from '@/lib/ctasStorage';
import {
  deleteGoalById,
  fetchGoals,
  nextGoalId,
  normalizeGoal,
  upsertGoal,
} from '@/lib/goalsStorage';
import {
  deleteScreenById,
  fetchScreens,
  nextScreenId,
  normalizeScreen,
  upsertScreen,
} from '@/lib/screensStorage';
import { fetchScreenSequences } from '@/lib/screenSequencesStorage';

const ResourcesContext = createContext(null);

function useRefetchOnFocus(reloaders) {
  useEffect(() => {
    const refetchAll = () => {
      reloaders.forEach((reload) => reload());
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetchAll();
      }
    };

    window.addEventListener('focus', refetchAll);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('focus', refetchAll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [reloaders]);
}

export function ResourcesProvider({ children }) {
  const characters = useRemoteCollection({
    fetchAll: fetchCharacters,
    upsertOne: upsertCharacter,
    deleteById: deleteCharacterById,
    normalize: normalizeCharacter,
    createEmpty: (id) => ({ id, name: '' }),
    getNextId: nextCharacterId,
  });

  const goals = useRemoteCollection({
    fetchAll: fetchGoals,
    upsertOne: upsertGoal,
    deleteById: deleteGoalById,
    normalize: normalizeGoal,
    createEmpty: (id) => ({ id, title: '', link: '', date: '' }),
    getNextId: nextGoalId,
  });

  const ctas = useRemoteCollection({
    fetchAll: fetchCtas,
    upsertOne: upsertCta,
    deleteById: deleteCtaById,
    normalize: normalizeCta,
    createEmpty: (id) => ({ id, text: '' }),
    getNextId: nextCtaId,
  });

  const captions = useRemoteCollection({
    fetchAll: fetchCaptions,
    upsertOne: upsertCaption,
    deleteById: deleteCaptionById,
    normalize: normalizeCaption,
    createEmpty: (id) => ({
      id,
      style: '',
      hookSignals: '',
      structure: '',
      guide: '',
      example: '',
      maxChars: null,
    }),
    getNextId: nextCaptionId,
  });

  const screens = useRemoteCollection({
    fetchAll: fetchScreens,
    upsertOne: upsertScreen,
    deleteById: deleteScreenById,
    normalize: normalizeScreen,
    createEmpty: (id) => ({ id, name: '', image: null, suggestedCopy: '' }),
    getNextId: nextScreenId,
  });

  const [screenSequences, setScreenSequences] = useState([]);
  const [screenSequencesLoading, setScreenSequencesLoading] = useState(true);
  const [screenSequencesError, setScreenSequencesError] = useState(null);

  const reloadScreenSequences = useCallback(async () => {
    try {
      const data = await fetchScreenSequences();
      setScreenSequences(data);
      setScreenSequencesError(null);
      return data;
    } catch (err) {
      setScreenSequencesError(err.message ?? 'Failed to load screen sequences');
      throw err;
    }
  }, []);

  useEffect(() => {
    let active = true;
    setScreenSequencesLoading(true);
    reloadScreenSequences()
      .catch(() => {})
      .finally(() => {
        if (active) setScreenSequencesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadScreenSequences]);

  const reloaders = useMemo(
    () => [
      characters.reload,
      goals.reload,
      ctas.reload,
      captions.reload,
      screens.reload,
      reloadScreenSequences,
    ],
    [
      characters.reload,
      goals.reload,
      ctas.reload,
      captions.reload,
      screens.reload,
      reloadScreenSequences,
    ]
  );

  useRefetchOnFocus(reloaders);

  const value = useMemo(
    () => ({
      characters,
      goals,
      ctas,
      captions,
      screens,
      screenSequences: {
        items: screenSequences,
        loading: screenSequencesLoading,
        error: screenSequencesError,
        reload: reloadScreenSequences,
      },
    }),
    [
      characters,
      goals,
      ctas,
      captions,
      screens,
      screenSequences,
      screenSequencesLoading,
      screenSequencesError,
      reloadScreenSequences,
    ]
  );

  return <ResourcesContext.Provider value={value}>{children}</ResourcesContext.Provider>;
}

export function useResources() {
  const context = useContext(ResourcesContext);
  if (!context) {
    throw new Error('useResources must be used within ResourcesProvider');
  }
  return context;
}
