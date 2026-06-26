import {
  deleteGoalById,
  fetchGoals,
  nextGoalId,
  normalizeGoal,
  upsertGoal,
} from '../lib/goalsStorage';
import { useRemoteCollection } from './useRemoteCollection';

export function useGoals() {
  const { items, loading, error, updateItem, addItem, deleteItem } = useRemoteCollection({
    fetchAll: fetchGoals,
    upsertOne: upsertGoal,
    deleteById: deleteGoalById,
    normalize: normalizeGoal,
    createEmpty: (id) => ({ id, title: '', link: '', date: '' }),
    getNextId: nextGoalId,
  });

  return {
    goals: items,
    loading,
    error,
    updateGoal: updateItem,
    addGoal: addItem,
    deleteGoal: deleteItem,
  };
}
