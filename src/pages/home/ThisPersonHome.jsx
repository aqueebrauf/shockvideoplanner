import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown } from 'lucide-react';
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
import { useGoals } from '@/hooks/useGoals';
import { useThisPeople } from '@/hooks/useThisPeople';
import { normalizeExternalUrl } from '@/lib/externalUrl';
import { formatGoalDateLabel } from '@/lib/goalDateLabel';
import { findGoal } from '@/lib/planResolvers';
import { PLAN_STATUS_COMPLETED, PLAN_STATUS_NOT_STARTED } from '@/lib/planStatus';
import {
  filterThisPeopleByGoalId,
  getGoalsWithThisPersonEntries,
  mergeThisPersonCaption,
  splitThisPeopleByCompletion,
} from '@/lib/thisPersonDisplay';
import { cn } from '@/lib/utils';

function ThisPersonEntryCard({
  entry,
  index,
  goalLink,
  goalTitle,
  isCompleted,
  onToggleComplete,
}) {
  const captionCopy = mergeThisPersonCaption(entry.caption, entry.hashtag);

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
          onClick={() => onToggleComplete(entry)}
          aria-label={
            isCompleted
              ? `Mark entry ${index + 1} as not started`
              : `Mark entry ${index + 1} as complete`
          }
          title={isCompleted ? 'Mark as not started' : 'Mark as complete'}
        >
          <Check className="size-5" />
        </Button>
      </div>

      <div className="home-plan-content">
        <div className="home-plan-field">
          <span className="home-plan-field__label">Hook</span>
          <p className="home-plan-field__value whitespace-pre-wrap">
            {entry.hookText.trim() || '—'}
          </p>
        </div>

        <div className="home-plan-field">
          <span className="home-plan-field__label">Caption</span>
          <p className="home-plan-field__value whitespace-pre-wrap">
            {entry.caption.trim() || '—'}
            {entry.hashtag.trim() ? (
              <span className="text-muted-foreground"> {entry.hashtag.trim()}</span>
            ) : null}
          </p>
        </div>

        <div className="home-plan-actions">
          <CopyTextButton
            value={entry.hookText}
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
          {goalLink ? (
            <Button
              render={
                <a
                  href={normalizeExternalUrl(goalLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              variant="outline"
              size="default"
              className="home-plan-action-btn"
              aria-label={`Open drive link for ${goalTitle ?? 'goal'}`}
            >
              Drive link
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function ThisPersonHome() {
  const { goals } = useGoals();
  const { thisPeople, loading, error, updateThisPerson } = useThisPeople();
  const [selectedGoalId, setSelectedGoalId] = useState('');

  const goalsWithEntries = useMemo(
    () => getGoalsWithThisPersonEntries(thisPeople, goals),
    [thisPeople, goals]
  );

  useEffect(() => {
    if (goalsWithEntries.length === 0) {
      setSelectedGoalId('');
      return;
    }

    setSelectedGoalId((current) => {
      if (current && goalsWithEntries.some((goal) => String(goal.id) === String(current))) {
        return String(current);
      }
      return String(goalsWithEntries[0].id);
    });
  }, [goalsWithEntries]);

  const selectedGoal = findGoal(goals, selectedGoalId ? Number(selectedGoalId) : null);
  const entries = useMemo(
    () =>
      selectedGoalId
        ? filterThisPeopleByGoalId(thisPeople, Number(selectedGoalId))
        : [],
    [thisPeople, selectedGoalId]
  );
  const { active: activeEntries, completed: completedEntries } = useMemo(
    () => splitThisPeopleByCompletion(entries),
    [entries]
  );
  const goalLink = selectedGoal?.link?.trim() ?? '';
  const goalTitle = selectedGoal?.title?.trim() ?? '';

  const goalSelectLabel = selectedGoal
    ? `${selectedGoal.title.trim() || `Goal ${selectedGoal.id}`}${
        selectedGoal.date ? ` · ${formatGoalDateLabel(selectedGoal.date)}` : ''
      }`
    : 'Select a goal';

  const toggleEntryComplete = (entry) => {
    const nextStatus =
      entry.status === PLAN_STATUS_COMPLETED
        ? PLAN_STATUS_NOT_STARTED
        : PLAN_STATUS_COMPLETED;
    updateThisPerson(entry.id, { status: nextStatus });
  };

  return (
    <div className="home-page">
      <p className="shrink-0 text-sm">
        <Link to="/" className="text-primary underline-offset-4 hover:underline">
          ← Home
        </Link>
      </p>

      <DataStatus loading={loading} error={error} />

      {!loading && goalsWithEntries.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No This person entries yet. Use the{' '}
          <Link to="/generator/this-person" className="text-primary underline-offset-4 hover:underline">
            This person generator
          </Link>{' '}
          to create some.
        </p>
      ) : null}

      {!loading && goalsWithEntries.length > 0 ? (
        <>
          <div className="shrink-0 space-y-2">
            <Label htmlFor="this-person-goal">Goal</Label>
            <Select
              value={selectedGoalId}
              onValueChange={setSelectedGoalId}
            >
              <SelectTrigger id="this-person-goal" className="w-full max-w-md">
                <SelectValue placeholder="Select a goal">{goalSelectLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {goalsWithEntries.map((goal) => (
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
              <p className="home-plan-empty">No entries for this goal.</p>
            ) : (
              <>
                {activeEntries.length === 0 ? (
                  <p className="home-plan-empty">No active entries for this goal.</p>
                ) : (
                  activeEntries.map((entry, index) => (
                    <ThisPersonEntryCard
                      key={entry.id}
                      entry={entry}
                      index={index}
                      goalLink={goalLink}
                      goalTitle={goalTitle}
                      isCompleted={false}
                      onToggleComplete={toggleEntryComplete}
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
                      {completedEntries.map((entry, index) => (
                        <ThisPersonEntryCard
                          key={entry.id}
                          entry={entry}
                          index={index}
                          goalLink={goalLink}
                          goalTitle={goalTitle}
                          isCompleted
                          onToggleComplete={toggleEntryComplete}
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
