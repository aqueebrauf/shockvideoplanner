import { useResources } from '@/providers/ResourcesProvider';

export function useThisPeople() {
  const { thisPeople } = useResources();

  return {
    thisPeople: thisPeople.items,
    loading: thisPeople.loading,
    error: thisPeople.error,
    updateThisPerson: thisPeople.updateItem,
    addThisPerson: thisPeople.addItem,
    deleteThisPerson: thisPeople.deleteItem,
    reloadThisPeople: thisPeople.reload,
  };
}
