import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
import {
  filterThisPeopleByGoalId,
  getGoalsWithThisPersonEntries,
  mergeThisPersonCaption,
} from '@/lib/thisPersonDisplay';

export default function ThisPersonHome() {
  const { goals } = useGoals();
  const { thisPeople, loading, error } = useThisPeople();
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
  const goalLink = selectedGoal?.link?.trim() ?? '';

  const goalSelectLabel = selectedGoal
    ? `${selectedGoal.title.trim() || `Goal ${selectedGoal.id}`}${
        selectedGoal.date ? ` · ${formatGoalDateLabel(selectedGoal.date)}` : ''
      }`
    : 'Select a goal';

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
              entries.map((entry, index) => {
                const captionCopy = mergeThisPersonCaption(entry.caption, entry.hashtag);

                return (
                  <article key={entry.id} className="home-this-person-entry">
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
                            aria-label={`Open drive link for ${selectedGoal?.title ?? 'goal'}`}
                          >
                            Drive link
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
