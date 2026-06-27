import { useCallback } from 'react';
import { useResources } from '@/providers/ResourcesProvider';
import { uploadScreenImage } from '@/lib/screenImageStorage';

export function useScreens() {
  const { screens } = useResources();

  const updateScreen = useCallback(
    async (id, patch) => {
      let nextPatch = patch;
      if (typeof patch.image === 'string' && patch.image.startsWith('data:')) {
        const url = await uploadScreenImage(id, patch.image);
        nextPatch = { ...patch, image: url };
      }
      await screens.updateItem(id, nextPatch);
    },
    [screens]
  );

  return {
    screens: screens.items,
    loading: screens.loading,
    error: screens.error,
    updateScreen,
    addScreen: screens.addItem,
    deleteScreen: screens.deleteItem,
    reloadScreens: screens.reload,
  };
}
