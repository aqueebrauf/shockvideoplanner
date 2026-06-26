import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const tableFieldClassName =
  'min-h-9 rounded-none border-0 bg-transparent px-3 py-2 shadow-none focus-visible:ring-0 dark:bg-transparent';

export function TableInput({ className, ...props }) {
  return <Input className={cn(tableFieldClassName, className)} {...props} />;
}

export function TableTextarea({ className, ...props }) {
  return (
    <Textarea
      className={cn(tableFieldClassName, 'min-h-9 resize-none', className)}
      {...props}
    />
  );
}
