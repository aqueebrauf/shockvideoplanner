import { useResources } from '@/providers/ResourcesProvider';

export function useCharacters() {
  const { characters } = useResources();

  return {
    characters: characters.items,
    loading: characters.loading,
    error: characters.error,
    updateCharacter: characters.updateItem,
    addCharacter: characters.addItem,
    deleteCharacter: characters.deleteItem,
    reloadCharacters: characters.reload,
  };
}
