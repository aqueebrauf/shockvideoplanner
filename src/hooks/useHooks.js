import { useResources } from '@/providers/ResourcesProvider';

export function useHooks() {
  const { hooks } = useResources();

  return {
    hooks: hooks.items,
    loading: hooks.loading,
    error: hooks.error,
    updateHook: hooks.updateItem,
    addHook: hooks.addItem,
    deleteHook: hooks.deleteItem,
    reloadHooks: hooks.reload,
  };
}
