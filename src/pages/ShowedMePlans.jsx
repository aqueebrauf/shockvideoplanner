import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Video } from 'lucide-react';
import DataStatus from '@/components/DataStatus';
import DeletePlanButton from '@/components/showedMe/DeletePlanButton';
import EditorToggle from '@/components/showedMe/EditorToggle';
import PageHeader from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCharacters } from '@/hooks/useCharacters';
import { useGoals } from '@/hooks/useGoals';
import { useShowedMePlans } from '@/hooks/useShowedMePlans';
import { formatGoalDateLabel } from '@/lib/goalDateLabel';
import { findEditor, findGoal } from '@/lib/planResolvers';
import { filterShowedMePlansByEditorId } from '@/lib/showedMePlanDisplay';
import { WORKFLOW_STATUS_READY } from '@/lib/showedMeAssetTypes';

export default function ShowedMePlans() {
  const navigate = useNavigate();
  const { goals } = useGoals();
  const { characters: editors } = useCharacters();
  const { plans, loading, error, addPlan, updatePlan } = useShowedMePlans();
  const [editorFilter, setEditorFilter] = useState('all');

  const visiblePlans = useMemo(
    () =>
      filterShowedMePlansByEditorId(
        plans,
        editorFilter !== 'all' ? Number(editorFilter) : null
      ),
    [plans, editorFilter]
  );

  const handleCreate = async () => {
    const plan = await addPlan({
      editorId: editorFilter !== 'all' ? Number(editorFilter) : null,
    });
    navigate(`/generator/${plan.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Showed Me"
        description="Create and manage demo + hook video production pipelines."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleCreate}>
            <Plus className="size-4" />
            New plan
          </Button>
          <Button type="button" variant="outline" render={<Link to="/resources/demo-library" />}>
            Demo library
          </Button>
        </div>
        <EditorToggle
          editors={editors}
          value={editorFilter}
          allowAll
          onChange={(next) => setEditorFilter(next === 'all' ? 'all' : String(next))}
        />
      </div>

      <DataStatus loading={loading} error={error} />

      {!loading && visiblePlans.length === 0 ? (
        <p className="text-sm text-muted-foreground">No plans yet. Create your first one.</p>
      ) : null}

      <div className="grid gap-3">
        {visiblePlans.map((plan) => {
          const goal = findGoal(goals, plan.goalId);
          const editor = findEditor(editors, plan.editorId);
          const goalLabel = goal?.title?.trim() || (plan.goalId ? `Goal ${plan.goalId}` : 'No goal');
          return (
            <div
              key={plan.id}
              className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <Link
                to={`/generator/${plan.id}`}
                className="flex min-w-0 items-start gap-3 transition-colors hover:text-primary"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Video className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">Plan #{plan.id}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {goalLabel}
                    {goal?.date ? ` · ${formatGoalDateLabel(goal.date)}` : ''}
                    {editor?.name?.trim() ? ` · ${editor.name.trim()}` : ''}
                  </p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {plan.hookText.trim() || 'No hook text yet'}
                  </p>
                </div>
              </Link>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <EditorToggle
                  editors={editors}
                  value={plan.editorId}
                  onChange={(next) => {
                    updatePlan(
                      plan.id,
                      { editorId: next === 'all' || next == null ? null : Number(next) },
                      { immediate: true }
                    );
                  }}
                />
                <Badge variant={plan.workflowStatus === WORKFLOW_STATUS_READY ? 'default' : 'secondary'}>
                  {plan.workflowStatus === WORKFLOW_STATUS_READY ? 'Ready' : 'Draft'}
                </Badge>
                <DeletePlanButton plan={plan} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
