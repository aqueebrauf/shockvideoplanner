import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CopyTextButton from '@/components/CopyTextButton';
import ScreensCopyModal from '@/components/ScreensCopyModal';
import { Button } from '@/components/ui/button';
import { usePlan } from '@/hooks/usePlan';
import { filterPlansForHomeByCharacter, screenSequenceButtonLabel } from '@/lib/planDisplay';
import { formatPlanSerial } from '@/lib/planSort';

export default function CharacterPlanPanel({ character }) {
  const { plan, loading } = usePlan();
  const [planIndex, setPlanIndex] = useState(0);
  const [screensModalRow, setScreensModalRow] = useState(null);

  const plansForCharacter = useMemo(
    () => filterPlansForHomeByCharacter(plan, character.name),
    [plan, character.name]
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

  if (loading) {
    return null;
  }

  if (!currentPlan) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No pending plans for {character.name}. Generate one in Generator or mark plans as not
        started in Plan.
      </p>
    );
  }

  const serial = formatPlanSerial(currentPlan.id);
  const sequenceLabel = screenSequenceButtonLabel(currentPlan.screenSequenceName);

  return (
    <>
      <div className="home-plan-nav">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={!canGoOlder}
          onClick={() => setPlanIndex((index) => index - 1)}
          aria-label="Older plan"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm tabular-nums text-muted-foreground">
          {planIndex + 1} of {totalPlans}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={!canGoNewer}
          onClick={() => setPlanIndex((index) => index + 1)}
          aria-label="Newer plan"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="home-plan-panel">
        <div className="home-plan-field">
          <div className="home-plan-field__header">
            <span className="home-plan-field__label">Hook</span>
            <CopyTextButton value={currentPlan.hook} label={`Copy hook for plan ${serial}`} />
          </div>
          <p className="home-plan-field__value whitespace-pre-wrap">
            {currentPlan.hook.trim() || '—'}
          </p>
        </div>

        <div className="home-plan-field">
          <span className="home-plan-field__label">Goal name</span>
          <p className="home-plan-field__value">{currentPlan.goalName.trim() || '—'}</p>
        </div>

        <div className="home-plan-field">
          <span className="home-plan-field__label">Screen sequence</span>
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setScreensModalRow(currentPlan)}
              aria-label={`${sequenceLabel} for plan ${serial}`}
            >
              {sequenceLabel}
            </Button>
          </div>
        </div>

        <div className="home-plan-field">
          <div className="home-plan-field__header">
            <span className="home-plan-field__label">Caption</span>
            <CopyTextButton
              value={currentPlan.caption}
              label={`Copy caption for plan ${serial}`}
            />
          </div>
          <p className="home-plan-field__value whitespace-pre-wrap">
            {currentPlan.caption.trim() || '—'}
          </p>
        </div>
      </div>

      {screensModalRow && (
        <ScreensCopyModal row={screensModalRow} onClose={() => setScreensModalRow(null)} />
      )}
    </>
  );
}
