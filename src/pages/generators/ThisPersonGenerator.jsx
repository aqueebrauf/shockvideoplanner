import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/layout/PageHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGoals } from '@/hooks/useGoals';
import { useThisPeople } from '@/hooks/useThisPeople';
import { generateThisPerson } from '@/lib/generateThisPerson';
import { formatGoalDateLabel, sortGoalsByRecent } from '@/lib/goalDateLabel';
import { nextThisPersonId, upsertThisPeople } from '@/lib/thisPeopleStorage';

export default function ThisPersonGenerator() {
  const navigate = useNavigate();
  const { goals } = useGoals();
  const { thisPeople, reloadThisPeople } = useThisPeople();
  const sortedGoals = useMemo(() => sortGoalsByRecent(goals), [goals]);

  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [hookText, setHookText] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  const selectedGoal = sortedGoals.find(
    (goal) => String(goal.id) === String(selectedGoalId)
  );
  const goalSelectLabel = selectedGoal
    ? `${selectedGoal.title.trim() || `Goal ${selectedGoal.id}`}${
        selectedGoal.date ? ` · ${formatGoalDateLabel(selectedGoal.date)}` : ''
      }`
    : 'Select a goal';

  const handleGenerate = async () => {
    if (!selectedGoalId) {
      setError('Select a goal.');
      return;
    }

    const goalTitle = selectedGoal?.title?.trim();
    if (!goalTitle) {
      setError('Selected goal needs a title.');
      return;
    }

    setError('');
    setGenerating(true);

    try {
      const result = await generateThisPerson({
        goalName: goalTitle,
        hookText: hookText.trim(),
        customInstruction: customInstruction.trim(),
      });

      let nextId = nextThisPersonId(thisPeople);
      const rows = result.entries.map((entry) => {
        const row = {
          id: nextId,
          goalId: Number(selectedGoalId),
          hookText: entry.hookText,
          caption: entry.caption,
          hashtag: entry.hashtag,
        };
        nextId += 1;
        return row;
      });

      await upsertThisPeople(rows);
      await reloadThisPeople();
      navigate('/resources/this-person');
    } catch (err) {
      setError(err.message || 'Could not generate This person entries.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <PageHeader
        title="This person"
        description="Generate hook, caption, and hashtag pairs for a goal and add them to the This person resource table."
      />

      <p className="mb-4 text-sm">
        <Link to="/generator" className="text-primary underline-offset-4 hover:underline">
          ← All generators
        </Link>
      </p>

      <Card className="max-w-2xl">
        <CardContent className="space-y-5 pt-6">
          <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="goal-select">
                Goal <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedGoalId ? String(selectedGoalId) : ''}
                onValueChange={setSelectedGoalId}
                disabled={generating || sortedGoals.length === 0}
              >
                <SelectTrigger id="goal-select" className="w-full">
                  <SelectValue placeholder="Select a goal">{goalSelectLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {sortedGoals.map((goal) => (
                    <SelectItem key={goal.id} value={String(goal.id)}>
                      {goal.title.trim() || `Goal ${goal.id}`}
                      {goal.date ? ` · ${formatGoalDateLabel(goal.date)}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Sorted by most recent goal date first.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hook-text-optional">Hook text (optional)</Label>
              <Textarea
                id="hook-text-optional"
                rows={3}
                placeholder='e.g. "This topper showed me how he tracks his study plan"'
                value={hookText}
                onChange={(event) => setHookText(event.target.value)}
                disabled={generating}
              />
              <p className="text-xs text-muted-foreground">
                If provided, this exact hook is used and only the caption and hashtags are
                generated. Leave blank to generate multiple hook variations.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-instruction">Instructions (optional)</Label>
              <Textarea
                id="custom-instruction"
                rows={4}
                placeholder="Extra context for tone, persona, audience, etc."
                value={customInstruction}
                onChange={(event) => setCustomInstruction(event.target.value)}
                disabled={generating}
              />
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Button type="button" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating…' : 'Generate'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
