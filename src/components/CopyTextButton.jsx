import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function CopyTextButton({ value, label, className, text, size = 'sm' }) {
  const [copied, setCopied] = useState(false);
  const copyableText = value?.trim();

  if (!copyableText) {
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

  if (text) {
    return (
      <Button
        type="button"
        variant="outline"
        size={size}
        className={className}
        onClick={copy}
        aria-label={label}
        title={copied ? 'Copied' : label}
      >
        {copied ? <Check /> : <Copy />}
        {copied ? 'Copied' : text}
      </Button>
    );
  }

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
