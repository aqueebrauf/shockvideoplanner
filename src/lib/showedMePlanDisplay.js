import { WORKFLOW_STATUS_READY } from './showedMeAssetTypes';
import { PLAN_STATUS_COMPLETED } from './planStatus';

export function mergeShowedMeCaption(caption, hashtag) {
  const base = caption?.trim() ?? '';
  const tags = hashtag?.trim() ?? '';
  if (!base && !tags) return '';
  if (!tags) return base;
  if (!base) return tags;
  return `${base} ${tags}`;
}

export function filterReadyShowedMePlans(plans) {
  return plans.filter((plan) => plan.workflowStatus === WORKFLOW_STATUS_READY);
}

export function splitShowedMePlansByCompletion(plans) {
  const active = [];
  const completed = [];
  for (const plan of plans) {
    if (plan.status === PLAN_STATUS_COMPLETED) {
      completed.push(plan);
    } else {
      active.push(plan);
    }
  }
  return { active, completed };
}

export function filterShowedMePlansByGoalId(plans, goalId) {
  if (!goalId) return [];
  return plans.filter((plan) => String(plan.goalId) === String(goalId));
}

export function getGoalsWithShowedMePlans(plans, goals) {
  const goalIds = new Set(
    plans
      .filter((plan) => plan.workflowStatus === WORKFLOW_STATUS_READY)
      .map((plan) => plan.goalId)
      .filter(Boolean)
  );
  return goals.filter((goal) => goalIds.has(goal.id));
}

export function findAssetById(assets, assetId) {
  if (!assetId) return null;
  return assets.find((asset) => asset.id === assetId) ?? null;
}

export function findSelectedAsset(assets, plan, assetType, selectedIdKey) {
  const selectedId = plan[selectedIdKey];
  const selected = findAssetById(assets, selectedId);
  if (selected) return selected;
  return assets.find((asset) => asset.assetType === assetType && asset.isSelected) ?? null;
}
