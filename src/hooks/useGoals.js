import { useResources } from '@/providers/ResourcesProvider';

export function useGoals() {
  const { goals } = useResources();

  return {
    goals: goals.items,
    loading: goals.loading,
    error: goals.error,
    updateGoal: goals.updateItem,
    addGoal: goals.addItem,
    deleteGoal: goals.deleteItem,
    reloadGoals: goals.reload,
  };
}
