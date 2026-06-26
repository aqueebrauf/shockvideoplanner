import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

export default function ScreensCopyModal({ row, onClose }) {
  const title = row.goalName.trim() || row.hook.trim() || 'Plan screens';

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85dvh] overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Screens with Copy</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-1">
          {row.screens.length === 0 ? (
            <p className="text-sm text-muted-foreground">No screens in this plan.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {row.screens.map((screen, index) => (
                <li key={index}>
                  <Card size="sm">
                    <CardContent className="space-y-2">
                      <p className="text-sm font-medium">
                        {screen.name.trim() || `Screen ${index + 1}`}
                      </p>
                      <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                        {screen.copy.trim() || '—'}
                      </p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ol>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
