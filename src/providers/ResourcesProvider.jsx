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
  deleteGoalById,
  fetchGoals,
  nextGoalId,
  normalizeGoal,
  upsertGoal,
} from '@/lib/goalsStorage';
import {
  deleteHookById,
  fetchHooks,
  nextHookId,
  normalizeHook,
  upsertHook,
} from '@/lib/hooksStorage';
import {
  deleteShowedMeHookById,
  fetchShowedMeHooks,
  nextShowedMeHookId,
  normalizeShowedMeHook,
  upsertShowedMeHook,
} from '@/lib/showedMeHooksStorage';
import {
  deleteThisPersonById,
  fetchThisPeople,
  nextThisPersonId,
  normalizeThisPerson,
  upsertThisPerson,
} from '@/lib/thisPeopleStorage';
import {
  deleteVerbatimById,
  fetchVerbatims,
  nextVerbatimId,
  normalizeVerbatim,
  upsertVerbatim,
} from '@/lib/verbatimsStorage';
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
    createEmpty: (id) => ({ id, title: '', link: '', date: '', hashtag: '' }),
    getNextId: nextGoalId,
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

  const verbatims = useRemoteCollection({
    fetchAll: fetchVerbatims,
    upsertOne: upsertVerbatim,
    deleteById: deleteVerbatimById,
    normalize: normalizeVerbatim,
    createEmpty: (id) => ({ id, text: '', status: 'not_started' }),
    getNextId: nextVerbatimId,
  });

  const hooks = useRemoteCollection({
    fetchAll: fetchHooks,
    upsertOne: upsertHook,
    deleteById: deleteHookById,
    normalize: normalizeHook,
    createEmpty: (id) => ({ id, text: '', verbatimId: null }),
    getNextId: nextHookId,
  });

  const showedMeHooks = useRemoteCollection({
    fetchAll: fetchShowedMeHooks,
    upsertOne: upsertShowedMeHook,
    deleteById: deleteShowedMeHookById,
    normalize: normalizeShowedMeHook,
    createEmpty: (id) => ({ id, goalId: null, text: '' }),
    getNextId: nextShowedMeHookId,
  });

  const thisPeople = useRemoteCollection({
    fetchAll: fetchThisPeople,
    upsertOne: upsertThisPerson,
    deleteById: deleteThisPersonById,
    normalize: normalizeThisPerson,
    createEmpty: (id) => ({
      id,
      goalId: null,
      hookText: '',
      caption: '',
      hashtag: '',
      status: 'not started',
    }),
    getNextId: nextThisPersonId,
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
      captions.reload,
      verbatims.reload,
      hooks.reload,
      showedMeHooks.reload,
      thisPeople.reload,
      reloadScreenSequences,
    ],
    [
      characters.reload,
      goals.reload,
      captions.reload,
      verbatims.reload,
      hooks.reload,
      showedMeHooks.reload,
      thisPeople.reload,
      reloadScreenSequences,
    ]
  );

  useRefetchOnFocus(reloaders);

  const value = useMemo(
    () => ({
      characters,
      goals,
      captions,
      verbatims,
      hooks,
      showedMeHooks,
      thisPeople,
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
      captions,
      verbatims,
      hooks,
      showedMeHooks,
      thisPeople,
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
