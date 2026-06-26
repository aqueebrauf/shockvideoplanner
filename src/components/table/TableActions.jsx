import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DeleteRowButton({ onClick, label }) {
  return (
    <Button type="button" variant="destructive" size="sm" onClick={onClick}>
      Delete
    </Button>
  );
}

export function AddRowButton({ onClick, label = 'Add row' }) {
  return (
    <Button type="button" variant="outline" size="sm" className="mt-3" onClick={onClick}>
      <Plus data-icon="inline-start" />
      {label}
    </Button>
  );
}
