import { useResources } from '@/providers/ResourcesProvider';

export function useScreenSequences() {
  const { screenSequences } = useResources();

  return {
    screenSequences: screenSequences.items,
    loading: screenSequences.loading,
    error: screenSequences.error,
    reloadScreenSequences: screenSequences.reload,
  };
}
