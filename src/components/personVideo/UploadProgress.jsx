import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UploadProgress({ label, progress, phase, className }) {
  if (!label) return null;

  const isDone = phase === 'done';
  const pct = Math.min(100, Math.max(0, progress ?? 0));

  return (
    <div
      className={cn(
        'rounded-lg border bg-muted/40 p-3 space-y-2',
        isDone && 'border-green-500/40 bg-green-500/5',
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm">
        {isDone ? (
          <CheckCircle2 className="size-4 shrink-0 text-green-600" />
        ) : (
          <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
        )}
        <span className={cn(isDone && 'text-green-700 dark:text-green-400')}>{label}</span>
        {!isDone && phase === 'uploading' ? (
          <span className="ml-auto tabular-nums text-muted-foreground">{pct}%</span>
        ) : null}
      </div>
      {!isDone ? (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-150 ease-out"
            style={{
              width: phase === 'uploading' ? `${pct}%` : phase === 'presigning' ? '15%' : '85%',
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
