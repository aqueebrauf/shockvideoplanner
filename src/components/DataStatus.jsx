import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function DataStatus({ loading, error }) {
  if (loading) {
    return (
      <div className="mb-3 flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-3">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return null;
}
