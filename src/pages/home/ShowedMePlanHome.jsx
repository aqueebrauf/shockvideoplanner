import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Copy, ExternalLink } from 'lucide-react';
import DataStatus from '@/components/DataStatus';
import EditorToggle from '@/components/showedMe/EditorToggle';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAllShowedMePlanAssets } from '@/hooks/useShowedMePlanAssets';
import { useCharacters } from '@/hooks/useCharacters';
import { useGoals } from '@/hooks/useGoals';
import { useShowedMePlans } from '@/hooks/useShowedMePlans';
import { formatGoalDateLabel } from '@/lib/goalDateLabel';
import { findGoal } from '@/lib/planResolvers';
import { PLAN_STATUS_COMPLETED, PLAN_STATUS_NOT_STARTED } from '@/lib/planStatus';
import {
  ASSET_TYPE_DEMO_CLIP,
  ASSET_TYPE_HOOK_VIDEO,
} from '@/lib/showedMeAssetTypes';
import { getActivePlanAsset } from '@/lib/showedMePlanAssetStorage';
import {
  filterShowedMePlansByEditorId,
  filterShowedMePlansByGoalId,
  getGoalsWithShowedMePlans,
  mergeShowedMeCaption,
  planAppearsOnHome,
  splitShowedMePlansByCompletion,
} from '@/lib/showedMePlanDisplay';

const PAGE_SIZE = 8;

function CopyAction({ value, label }) {
  const [copied, setCopied] = useState(false);
  const text = value?.trim() ?? '';

  const copy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="home-gallery-btn"
      disabled={!text}
      onClick={copy}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? 'Copied' : label}
    </Button>
  );
}

function GalleryCard({ plan, assets, isCompleted, onToggleComplete }) {
  const hookVideo = getActivePlanAsset(
    assets,
    plan.id,
    ASSET_TYPE_HOOK_VIDEO,
    plan.selectedHookVideoId
  );
  const demoClip = getActivePlanAsset(
    assets,
    plan.id,
    ASSET_TYPE_DEMO_CLIP,
    plan.selectedDemoAssetId
  );
  const captionCopy = mergeShowedMeCaption(plan.caption, plan.hashtag);
  const hookText = plan.hookText.trim();
  const demoUrl = demoClip?.publicUrl?.trim() || '';

  return (
    <article className="home-gallery-card">
      {hookVideo?.publicUrl ? (
        <video
          src={hookVideo.publicUrl}
          className="home-gallery-video"
          controls
          playsInline
          preload="metadata"
        />
      ) : (
        <div className="home-gallery-video home-gallery-video--empty">No hook</div>
      )}
      <div className="home-gallery-actions">
        <CopyAction value={hookText} label="Hook" />
        <CopyAction value={captionCopy} label="Caption" />
        {demoUrl ? (
          <Button
            variant="outline"
            size="sm"
            className="home-gallery-btn"
            render={<a href={demoUrl} target="_blank" rel="noopener noreferrer" />}
          >
            <ExternalLink className="size-3.5" />
            Demo
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="home-gallery-btn" disabled>
            <ExternalLink className="size-3.5" />
            Demo
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          variant={isCompleted ? 'default' : 'outline'}
          className="home-gallery-btn"
          onClick={() => onToggleComplete(plan)}
        >
          {isCompleted ? <Check className="size-3.5" /> : null}
          {isCompleted ? 'Done' : 'Complete'}
        </Button>
      </div>
    </article>
  );
}

export default function ShowedMePlanHome() {
  const { goals } = useGoals();
  const { characters: editors } = useCharacters();
  const { plans, loading, error, updatePlan } = useShowedMePlans();
  const {
    assets,
    loading: assetsLoading,
    error: assetsError,
  } = useAllShowedMePlanAssets();
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [selectedEditorId, setSelectedEditorId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);

  const homePlans = useMemo(
    () => plans.filter((plan) => planAppearsOnHome(plan, assets)),
    [plans, assets]
  );

  const goalsWithPlans = useMemo(
    () => getGoalsWithShowedMePlans(homePlans, goals),
    [homePlans, goals]
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

  const filteredPlans = useMemo(() => {
    const byGoal = selectedGoalId
      ? filterShowedMePlansByGoalId(homePlans, Number(selectedGoalId))
      : [];
    return filterShowedMePlansByEditorId(
      byGoal,
      selectedEditorId !== 'all' ? Number(selectedEditorId) : null
    );
  }, [homePlans, selectedGoalId, selectedEditorId]);

  const { active: pendingPlans, completed: completedPlans } = useMemo(
    () => splitShowedMePlansByCompletion(filteredPlans),
    [filteredPlans]
  );

  const visiblePlans = statusFilter === 'completed' ? completedPlans : pendingPlans;
  const pageCount = Math.max(1, Math.ceil(visiblePlans.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pagePlans = visiblePlans.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [selectedGoalId, selectedEditorId, statusFilter]);

  const goalSelectLabel = selectedGoal
    ? `${selectedGoal.title.trim() || `Goal ${selectedGoal.id}`}${
        selectedGoal.date ? ` · ${formatGoalDateLabel(selectedGoal.date)}` : ''
      }`
    : 'Goal';

  const toggleComplete = (plan) => {
    const nextStatus =
      plan.status === PLAN_STATUS_COMPLETED
        ? PLAN_STATUS_NOT_STARTED
        : PLAN_STATUS_COMPLETED;
    updatePlan(plan.id, { status: nextStatus }, { immediate: true });
  };

  return (
    <div className="home-page">
      <DataStatus loading={loading || assetsLoading} error={error || assetsError} />

      {!loading && homePlans.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No Showed Me plans yet.{' '}
          <Link
            to="/generator"
            className="text-primary underline-offset-4 hover:underline"
          >
            Create a plan
          </Link>
          .
        </p>
      ) : null}

      {!loading && homePlans.length > 0 ? (
        <>
          <div className="home-gallery-toolbar">
            <div className="home-gallery-toolbar__row">
              <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
                <SelectTrigger className="w-full sm:max-w-xs" aria-label="Goal">
                  <SelectValue placeholder="Goal">{goalSelectLabel}</SelectValue>
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
              <EditorToggle
                editors={editors}
                value={selectedEditorId}
                allowAll
                onChange={(next) => setSelectedEditorId(next === 'all' ? 'all' : String(next))}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
              >
                Pending {pendingPlans.length}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('completed')}
              >
                Completed {completedPlans.length}
              </Button>
            </div>
          </div>

          {pagePlans.length === 0 ? (
            <p className="home-plan-empty">Nothing here yet.</p>
          ) : (
            <div className="home-gallery">
              {pagePlans.map((plan) => (
                <GalleryCard
                  key={plan.id}
                  plan={plan}
                  assets={assets}
                  isCompleted={statusFilter === 'completed'}
                  onToggleComplete={toggleComplete}
                />
              ))}
            </div>
          )}

          {visiblePlans.length > PAGE_SIZE ? (
            <div className="home-gallery-pager">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={safePage <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft className="size-4" />
                Prev
              </Button>
              <span className="text-xs tabular-nums text-muted-foreground">
                {safePage} / {pageCount}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={safePage >= pageCount}
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
