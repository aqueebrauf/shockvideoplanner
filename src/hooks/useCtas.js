import { useResources } from '@/providers/ResourcesProvider';

export function useCtas() {
  const { ctas } = useResources();

  return {
    ctas: ctas.items,
    loading: ctas.loading,
    error: ctas.error,
    updateCta: ctas.updateItem,
    addCta: ctas.addItem,
    deleteCta: ctas.deleteItem,
    reloadCtas: ctas.reload,
  };
}
