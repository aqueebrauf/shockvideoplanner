import { useResources } from '@/providers/ResourcesProvider';

export function useVerbatims() {
  const { verbatims } = useResources();

  return {
    verbatims: verbatims.items,
    loading: verbatims.loading,
    error: verbatims.error,
    updateVerbatim: verbatims.updateItem,
    addVerbatim: verbatims.addItem,
    deleteVerbatim: verbatims.deleteItem,
    reloadVerbatims: verbatims.reload,
  };
}
