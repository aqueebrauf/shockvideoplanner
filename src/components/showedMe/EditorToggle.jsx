import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function EditorToggle({
  editors,
  value,
  onChange,
  allowAll = false,
  className,
}) {
  const selected = value == null || value === '' || value === 'all' ? 'all' : String(value);

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {allowAll ? (
        <Button
          type="button"
          size="sm"
          variant={selected === 'all' ? 'default' : 'outline'}
          onClick={() => onChange('all')}
        >
          All
        </Button>
      ) : null}
      {editors.map((editor) => {
        const id = String(editor.id);
        const active = selected === id;
        return (
          <Button
            key={editor.id}
            type="button"
            size="sm"
            variant={active ? 'default' : 'outline'}
            onClick={() => onChange(active && !allowAll ? 'all' : editor.id)}
          >
            {editor.name.trim() || `Editor ${editor.id}`}
          </Button>
        );
      })}
    </div>
  );
}
