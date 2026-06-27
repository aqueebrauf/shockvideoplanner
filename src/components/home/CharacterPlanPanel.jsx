import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CopyTextButton from '@/components/CopyTextButton';
import ScreensCopyModal from '@/components/ScreensCopyModal';
import { Button } from '@/components/ui/button';
import { useGoals } from '@/hooks/useGoals';
import { usePlan } from '@/hooks/usePlan';
import { useScreenSequences } from '@/hooks/useScreenSequences';
import {
  filterPlansForHomeByCharacterId,
  getCharacterPlanStats,
  screenSequenceButtonLabel,
} from '@/lib/planDisplay';
import { resolveGoalTitle, resolveScreenSequenceName } from '@/lib/planResolvers';
import { formatPlanSerial } from '@/lib/planSort';
import { PLAN_STATUS_COMPLETED, PLAN_STATUS_NOT_STARTED } from '@/lib/planStatus';
import { cn } from '@/lib/utils';

function PlanStat({ label, value, active = false, onClick }) {
  const isInteractive = Boolean(onClick);

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cn(
          'home-plan-stat home-plan-stat--interactive',
          active && 'home-plan-stat--active'
        )}
      >
        <span className="home-plan-stat__label">{label}</span>
        <span className="home-plan-stat__value">{value}</span>
      </button>
    );
  }

  return (
    <div className="home-plan-stat">
      <span className="home-plan-stat__label">{label}</span>
      <span className="home-plan-stat__value">{value}</span>
    </div>
  );
}

export default function CharacterPlanPanel({ character }) {
  const { plan, loading, updatePlan } = usePlan();
  const { goals } = useGoals();
  const { screenSequences } = useScreenSequences();
  const [statusFilter, setStatusFilter] = useState(PLAN_STATUS_NOT_STARTED);
  const [planIndex, setPlanIndex] = useState(0);
  const [screensModalRow, setScreensModalRow] = useState(null);

  const stats = useMemo(
    () => getCharacterPlanStats(plan, character.id),
    [plan, character.id]
  );

  const plansForCharacter = useMemo(
    () => filterPlansForHomeByCharacterId(plan, character.id, statusFilter),
    [plan, character.id, statusFilter]
  );

  useEffect(() => {
    setPlanIndex(0);
  }, [character.id, statusFilter]);

  useEffect(() => {
    setPlanIndex((index) =>
      Math.min(index, Math.max(0, plansForCharacter.length - 1))
    );
  }, [plansForCharacter.length]);

  const currentPlan = plansForCharacter[planIndex];
  const canGoOlder = planIndex > 0;
  const canGoNewer = planIndex < plansForCharacter.length - 1;
  const viewingNotStarted = statusFilter === PLAN_STATUS_NOT_STARTED;

  const markCurrentPlanComplete = () => {
    if (!currentPlan) return;
    updatePlan(currentPlan.id, { status: PLAN_STATUS_COMPLETED }, { immediate: true });
  };

  if (loading) {
    return null;
  }

  const goalTitle = currentPlan ? resolveGoalTitle(currentPlan, goals) : '';
  const sequenceLabel = currentPlan
    ? screenSequenceButtonLabel(resolveScreenSequenceName(currentPlan, screenSequences))
    : 'Screens';
  const planSerial = currentPlan ? formatPlanSerial(currentPlan.id) : '';

  const emptyMessage = viewingNotStarted
    ? 'No not started plans.'
    : 'No completed plans yet.';

  return (
    <div className="home-character-panel">
      <div className="home-plan-stats">
        <PlanStat label="Total" value={stats.total} />
        <PlanStat
          label="Completed"
          value={stats.completed}
          active={statusFilter === PLAN_STATUS_COMPLETED}
          onClick={() => setStatusFilter(PLAN_STATUS_COMPLETED)}
        />
        <PlanStat
          label="Not started"
          value={stats.notStarted}
          active={statusFilter === PLAN_STATUS_NOT_STARTED}
          onClick={() => setStatusFilter(PLAN_STATUS_NOT_STARTED)}
        />
      </div>

      <div className="home-plan-workspace">
        {currentPlan ? (
          <>
            <div className="home-plan-panel">
              <div className="home-plan-field home-plan-field--hook">
                <span className="home-plan-field__label">Hook</span>
                <p className="home-plan-field__value home-plan-field__value--scroll whitespace-pre-wrap">
                  {currentPlan.hook.trim() || '—'}
                </p>
              </div>

              <div className="home-plan-field home-plan-field--compact">
                <span className="home-plan-field__label">Goal name</span>
                <p className="home-plan-field__value">{goalTitle || '—'}</p>
              </div>

              <div className="home-plan-actions">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  className="home-plan-action-btn"
                  onClick={() => setScreensModalRow(currentPlan)}
                  aria-label={`${sequenceLabel} for plan ${planSerial}`}
                >
                  {sequenceLabel}
                </Button>
                <CopyTextButton
                  value={currentPlan.hook}
                  text="Copy Hook"
                  size="default"
                  label={`Copy hook for plan ${planSerial}`}
                  className="home-plan-action-btn"
                />
                <CopyTextButton
                  value={currentPlan.caption}
                  text="Copy caption"
                  size="default"
                  label={`Copy caption for plan ${planSerial}`}
                  className="home-plan-action-btn"
                />
              </div>
            </div>

            <div className="home-plan-controls">
              <Button
                type="button"
                variant="outline"
                size="default"
                disabled={!canGoOlder}
                onClick={() => setPlanIndex((index) => index - 1)}
                aria-label="Previous plan"
              >
                <ChevronLeft className="size-4" />
                Prev
              </Button>
              {viewingNotStarted ? (
                <Button
                  type="button"
                  size="default"
                  onClick={markCurrentPlanComplete}
                  aria-label={`Mark plan ${planSerial} as complete`}
                >
                  Mark as complete
                </Button>
              ) : (
                <span aria-hidden="true" />
              )}
              <Button
                type="button"
                variant="outline"
                size="default"
                disabled={!canGoNewer}
                onClick={() => setPlanIndex((index) => index + 1)}
                aria-label="Next plan"
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </>
        ) : (
          <p className="home-plan-empty">{emptyMessage}</p>
        )}
      </div>

      {screensModalRow && (
        <ScreensCopyModal row={screensModalRow} onClose={() => setScreensModalRow(null)} />
      )}
    </div>
  );
}
