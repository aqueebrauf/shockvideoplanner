import { Link, useNavigate } from 'react-router-dom';
import { Plus, Video } from 'lucide-react';
import DataStatus from '@/components/DataStatus';
import PageHeader from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCharacters } from '@/hooks/useCharacters';
import { useGoals } from '@/hooks/useGoals';
import { useShowedMePlans } from '@/hooks/useShowedMePlans';
import { formatGoalDateLabel } from '@/lib/goalDateLabel';
import { findEditor, findGoal } from '@/lib/planResolvers';
import { WORKFLOW_STATUS_READY } from '@/lib/showedMeAssetTypes';

export default function ShowedMePlans() {
  const navigate = useNavigate();
  const { goals } = useGoals();
  const { characters: editors } = useCharacters();
  const { plans, loading, error, addPlan } = useShowedMePlans();

  const handleCreate = async () => {
    const plan = await addPlan({});
    navigate(`/generator/${plan.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Showed Me"
        description="Create and manage demo + hook video production pipelines."
      />

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={handleCreate}>
          <Plus className="size-4" />
          New plan
        </Button>
        <Button type="button" variant="outline" render={<Link to="/resources/demo-library" />}>
          Demo library
        </Button>
      </div>

      <DataStatus loading={loading} error={error} />

      {!loading && plans.length === 0 ? (
        <p className="text-sm text-muted-foreground">No plans yet. Create your first one.</p>
      ) : null}

      <div className="grid gap-3">
        {plans.map((plan) => {
          const goal = findGoal(goals, plan.goalId);
          const editor = findEditor(editors, plan.editorId);
          const goalLabel = goal?.title?.trim() || (plan.goalId ? `Goal ${plan.goalId}` : 'No goal');
          const editorLabel = editor?.name?.trim() || 'No editor';
          return (
            <Link
              key={plan.id}
              to={`/generator/${plan.id}`}
              className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/20"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Video className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">Plan #{plan.id}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {goalLabel}
                    {goal?.date ? ` · ${formatGoalDateLabel(goal.date)}` : ''}
                    {` · ${editorLabel}`}
                  </p>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {plan.hookText.trim() || 'No hook text yet'}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant={plan.workflowStatus === WORKFLOW_STATUS_READY ? 'default' : 'secondary'}>
                  {plan.workflowStatus === WORKFLOW_STATUS_READY ? 'Ready' : 'Draft'}
                </Badge>
                {editor?.name?.trim() ? (
                  <Badge variant="outline">{editor.name.trim()}</Badge>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
