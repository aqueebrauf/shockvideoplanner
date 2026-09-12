import { useResources } from '@/providers/ResourcesProvider';

export function useShowedMeHooks() {
  const { showedMeHooks } = useResources();

  return {
    showedMeHooks: showedMeHooks.items,
    loading: showedMeHooks.loading,
    error: showedMeHooks.error,
    updateShowedMeHook: showedMeHooks.updateItem,
    addShowedMeHook: showedMeHooks.addItem,
    deleteShowedMeHook: showedMeHooks.deleteItem,
    reloadShowedMeHooks: showedMeHooks.reload,
  };
}
