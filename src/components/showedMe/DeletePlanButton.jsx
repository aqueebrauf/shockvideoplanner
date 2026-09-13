import { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useShowedMePlans } from '@/hooks/useShowedMePlans';

export default function DeletePlanButton({ plan, onDeleted, variant = 'outline', size = 'sm' }) {
  const { deletePlan } = useShowedMePlans();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const handleOpenChange = (next) => {
    if (busy) return;
    setOpen(next);
    if (!next) setActionError('');
  };

  const handleConfirm = async () => {
    setBusy(true);
    setActionError('');
    try {
      await deletePlan(plan.id);
      setOpen(false);
      onDeleted?.(plan);
    } catch (err) {
      setActionError(err.message ?? 'Could not delete this plan.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button type="button" variant={variant} size={size} onClick={() => setOpen(true)}>
        <Trash2 />
        Delete
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete plan #{plan.id}?</DialogTitle>
            <DialogDescription>
              This permanently removes the plan and its uploaded hook and demo files. Shared
              demo library clips stay in the library.
            </DialogDescription>
          </DialogHeader>
          {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={busy} onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" disabled={busy} onClick={handleConfirm}>
              {busy ? <Loader2 className="animate-spin" /> : <Trash2 />}
              Delete plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
