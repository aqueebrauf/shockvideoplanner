import { PLAN_STATUS_COMPLETED } from './planStatus';
import {
  ASSET_TYPE_DEMO_CLIP,
  ASSET_TYPE_HOOK_VIDEO,
  WORKFLOW_STATUS_READY,
} from './showedMeAssetTypes';
import { assetHasFile, getActivePlanAsset } from './showedMePlanAssetStorage';

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

export function planAppearsOnHome(plan, assets = []) {
  if (plan.workflowStatus === WORKFLOW_STATUS_READY) return true;
  if (plan.hookText?.trim() || plan.caption?.trim()) return true;
  return (
    assetHasFile(
      getActivePlanAsset(assets, plan.id, ASSET_TYPE_HOOK_VIDEO, plan.selectedHookVideoId)
    ) ||
    assetHasFile(getActivePlanAsset(assets, plan.id, ASSET_TYPE_DEMO_CLIP, plan.selectedDemoAssetId))
  );
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

export function filterShowedMePlansByEditorId(plans, editorId) {
  if (!editorId) return plans;
  return plans.filter((plan) => String(plan.editorId) === String(editorId));
}

export function getGoalsWithShowedMePlans(plans, goals) {
  const goalIds = new Set(plans.map((plan) => plan.goalId).filter(Boolean));
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
