import { useResources } from '@/providers/ResourcesProvider';

export function useCaptions() {
  const { captions } = useResources();

  return {
    captions: captions.items,
    loading: captions.loading,
    error: captions.error,
    updateCaption: captions.updateItem,
    addCaption: captions.addItem,
    deleteCaption: captions.deleteItem,
    reloadCaptions: captions.reload,
  };
}
