import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function CopyTextButton({ value, label, className }) {
  const [copied, setCopied] = useState(false);
  const text = value?.trim();

  if (!text) {
    return null;
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className={cn('text-muted-foreground hover:text-foreground', className)}
      onClick={copy}
      aria-label={label}
      title={copied ? 'Copied' : label}
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  );
}
