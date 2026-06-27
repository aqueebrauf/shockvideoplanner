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
import { PLAN_STATUS_COMPLETED } from '@/lib/planStatus';

function PlanStat({ label, value }) {
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
  const [planIndex, setPlanIndex] = useState(0);
  const [screensModalRow, setScreensModalRow] = useState(null);

  const stats = useMemo(
    () => getCharacterPlanStats(plan, character.id),
    [plan, character.id]
  );

  const plansForCharacter = useMemo(
    () => filterPlansForHomeByCharacterId(plan, character.id),
    [plan, character.id]
  );

  useEffect(() => {
    setPlanIndex(0);
  }, [character.id]);

  useEffect(() => {
    setPlanIndex((index) =>
      Math.min(index, Math.max(0, plansForCharacter.length - 1))
    );
  }, [plansForCharacter.length]);

  const currentPlan = plansForCharacter[planIndex];
  const totalPlans = plansForCharacter.length;
  const canGoOlder = planIndex > 0;
  const canGoNewer = planIndex < totalPlans - 1;

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

  return (
    <div className="home-character-panel">
      <div className="home-plan-stats">
        <PlanStat label="Total" value={stats.total} />
        <PlanStat label="Completed" value={stats.completed} />
        <PlanStat label="Not started" value={stats.notStarted} />
      </div>

      {currentPlan ? (
        <>
          <div className="home-plan-panel">
            <div className="home-plan-field">
              <span className="home-plan-field__label">Hook</span>
              <p className="home-plan-field__value whitespace-pre-wrap">
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
                size="sm"
                className="home-plan-action-btn"
                onClick={() => setScreensModalRow(currentPlan)}
                aria-label={`${sequenceLabel} for plan ${planSerial}`}
              >
                {sequenceLabel}
              </Button>
              <CopyTextButton
                value={currentPlan.hook}
                text="Copy Hook"
                label={`Copy hook for plan ${planSerial}`}
                className="home-plan-action-btn"
              />
              <CopyTextButton
                value={currentPlan.caption}
                text="Copy caption"
                label={`Copy caption for plan ${planSerial}`}
                className="home-plan-action-btn"
              />
            </div>
          </div>

          <div className="home-plan-controls">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canGoOlder}
              onClick={() => setPlanIndex((index) => index - 1)}
              aria-label="Previous plan"
            >
              <ChevronLeft className="size-4" />
              Prev
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={markCurrentPlanComplete}
              aria-label={`Mark plan ${planSerial} as complete`}
            >
              Mark as complete
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
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
        <p className="py-8 text-center text-sm text-muted-foreground">
          No plans to work on. All plans are completed.
        </p>
      )}

      {screensModalRow && (
        <ScreensCopyModal row={screensModalRow} onClose={() => setScreensModalRow(null)} />
      )}
    </div>
  );
}
