import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, ExternalLink } from 'lucide-react';
import CopyTextButton from '@/components/CopyTextButton';
import DataStatus from '@/components/DataStatus';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAllPersonPlanAssets } from '@/hooks/usePersonPlanAssets';
import { useGoals } from '@/hooks/useGoals';
import { usePersonVideoPlans } from '@/hooks/usePersonVideoPlans';
import { formatGoalDateLabel } from '@/lib/goalDateLabel';
import { findGoal } from '@/lib/planResolvers';
import { PLAN_STATUS_COMPLETED, PLAN_STATUS_NOT_STARTED } from '@/lib/planStatus';
import {
  ASSET_TYPE_DEMO_CLIP,
  ASSET_TYPE_HOOK_VIDEO,
} from '@/lib/personVideoAssetTypes';
import {
  filterPersonVideoPlansByGoalId,
  findAssetById,
  getGoalsWithPersonVideoPlans,
  mergePersonVideoCaption,
  splitPersonVideoPlansByCompletion,
} from '@/lib/personVideoPlanDisplay';
import { cn } from '@/lib/utils';

function VideoLinkButton({ href, label }) {
  if (!href?.trim()) return null;
  return (
    <Button
      render={
        <a href={href} target="_blank" rel="noopener noreferrer" />
      }
      variant="outline"
      size="default"
      className="home-plan-action-btn"
    >
      <ExternalLink className="size-4" />
      {label}
    </Button>
  );
}

function PersonVideoPlanEntryCard({
  plan,
  assets,
  index,
  isCompleted,
  onToggleComplete,
}) {
  const hookVideo =
    findAssetById(assets, plan.selectedHookVideoId) ??
    assets.find(
      (a) => a.planId === plan.id && a.assetType === ASSET_TYPE_HOOK_VIDEO && a.isSelected
    );
  const demoClip =
    findAssetById(assets, plan.selectedDemoAssetId) ??
    assets.find(
      (a) => a.planId === plan.id && a.assetType === ASSET_TYPE_DEMO_CLIP && a.isSelected
    );
  const captionCopy = mergePersonVideoCaption(plan.caption, plan.hashtag);

  return (
    <article className="home-this-person-entry">
      <div className="home-this-person-entry__toolbar">
        <Button
          type="button"
          variant="outline"
          size="default"
          className={cn(
            'home-plan-status-btn home-this-person-status-btn',
            isCompleted ? 'home-plan-status-btn--marked' : 'home-plan-status-btn--unmarked'
          )}
          onClick={() => onToggleComplete(plan)}
          aria-label={
            isCompleted
              ? `Mark plan ${index + 1} as not started`
              : `Mark plan ${index + 1} as complete`
          }
        >
          <Check className="size-5" />
        </Button>
      </div>

      <div className="home-plan-content">
        <div className="home-plan-field">
          <span className="home-plan-field__label">Hook</span>
          <p className="home-plan-field__value whitespace-pre-wrap">
            {plan.hookText.trim() || '—'}
          </p>
        </div>

        <div className="home-plan-field">
          <span className="home-plan-field__label">Caption</span>
          <p className="home-plan-field__value whitespace-pre-wrap">
            {plan.caption.trim() || '—'}
            {plan.hashtag.trim() ? (
              <span className="text-muted-foreground"> {plan.hashtag.trim()}</span>
            ) : null}
          </p>
        </div>

        <div className="home-plan-actions">
          <VideoLinkButton href={hookVideo?.publicUrl} label="Hook clip" />
          <VideoLinkButton href={demoClip?.publicUrl} label="Demo clip" />
          <CopyTextButton
            value={plan.hookText}
            text="Copy Hook"
            size="default"
            label={`Copy hook ${index + 1}`}
            className="home-plan-action-btn"
          />
          <CopyTextButton
            value={captionCopy}
            text="Copy caption"
            size="default"
            label={`Copy caption ${index + 1}`}
            className="home-plan-action-btn"
          />
        </div>
      </div>
    </article>
  );
}

export default function PersonVideoPlanHome() {
  const { goals } = useGoals();
  const { plans, loading, error, updatePlan } = usePersonVideoPlans();
  const {
    assets,
    loading: assetsLoading,
    error: assetsError,
  } = useAllPersonPlanAssets();
  const [selectedGoalId, setSelectedGoalId] = useState('');

  const readyPlans = useMemo(
    () => plans.filter((plan) => plan.workflowStatus === 'ready'),
    [plans]
  );

  const goalsWithPlans = useMemo(
    () => getGoalsWithPersonVideoPlans(readyPlans, goals),
    [readyPlans, goals]
  );

  useEffect(() => {
    if (goalsWithPlans.length === 0) {
      setSelectedGoalId('');
      return;
    }
    setSelectedGoalId((current) => {
      if (current && goalsWithPlans.some((goal) => String(goal.id) === String(current))) {
        return String(current);
      }
      return String(goalsWithPlans[0].id);
    });
  }, [goalsWithPlans]);

  const selectedGoal = findGoal(goals, selectedGoalId ? Number(selectedGoalId) : null);
  const entries = useMemo(
    () =>
      selectedGoalId
        ? filterPersonVideoPlansByGoalId(readyPlans, Number(selectedGoalId))
        : [],
    [readyPlans, selectedGoalId]
  );
  const { active: activeEntries, completed: completedEntries } = useMemo(
    () => splitPersonVideoPlansByCompletion(entries),
    [entries]
  );

  const goalSelectLabel = selectedGoal
    ? `${selectedGoal.title.trim() || `Goal ${selectedGoal.id}`}${
        selectedGoal.date ? ` · ${formatGoalDateLabel(selectedGoal.date)}` : ''
      }`
    : 'Select a goal';

  const toggleComplete = (plan) => {
    const nextStatus =
      plan.status === PLAN_STATUS_COMPLETED
        ? PLAN_STATUS_NOT_STARTED
        : PLAN_STATUS_COMPLETED;
    updatePlan(plan.id, { status: nextStatus }, { immediate: true });
  };

  return (
    <div className="home-page">
      <p className="shrink-0 text-sm">
        <Link to="/" className="text-primary underline-offset-4 hover:underline">
          ← Home
        </Link>
      </p>

      <DataStatus loading={loading || assetsLoading} error={error || assetsError} />

      {!loading && readyPlans.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No ready person video plans yet.{' '}
          <Link
            to="/person-video-plans"
            className="text-primary underline-offset-4 hover:underline"
          >
            Create a plan
          </Link>{' '}
          and mark it ready for editors.
        </p>
      ) : null}

      {!loading && readyPlans.length > 0 ? (
        <>
          <div className="shrink-0 space-y-2">
            <Label htmlFor="person-video-goal">Goal</Label>
            <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
              <SelectTrigger id="person-video-goal" className="w-full max-w-md">
                <SelectValue placeholder="Select a goal">{goalSelectLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {goalsWithPlans.map((goal) => (
                  <SelectItem key={goal.id} value={String(goal.id)}>
                    {goal.title.trim() || `Goal ${goal.id}`}
                    {goal.date ? ` · ${formatGoalDateLabel(goal.date)}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="home-this-person-list">
            {entries.length === 0 ? (
              <p className="home-plan-empty">No ready plans for this goal.</p>
            ) : (
              <>
                {activeEntries.length === 0 ? (
                  <p className="home-plan-empty">No active plans for this goal.</p>
                ) : (
                  activeEntries.map((plan, index) => (
                    <PersonVideoPlanEntryCard
                      key={plan.id}
                      plan={plan}
                      assets={assets}
                      index={index}
                      isCompleted={false}
                      onToggleComplete={toggleComplete}
                    />
                  ))
                )}

                {completedEntries.length > 0 ? (
                  <details className="home-this-person-completed">
                    <summary className="home-this-person-completed__summary">
                      <span>Completed ({completedEntries.length})</span>
                      <ChevronDown className="home-this-person-completed__chevron size-4" />
                    </summary>
                    <div className="home-this-person-completed__list">
                      {completedEntries.map((plan, index) => (
                        <PersonVideoPlanEntryCard
                          key={plan.id}
                          plan={plan}
                          assets={assets}
                          index={index}
                          isCompleted
                          onToggleComplete={toggleComplete}
                        />
                      ))}
                    </div>
                  </details>
                ) : null}
              </>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
