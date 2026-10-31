import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, GripVertical, Pencil, Star, Trash2, Upload } from 'lucide-react';
import CopyTextButton from '@/components/CopyTextButton';
import UploadProgress from '@/components/showedMe/UploadProgress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatDisplayName } from '@/lib/viralFormatsStorage';
import { cn } from '@/lib/utils';

const URL_PATTERN = /https?:\/\/[^\s<>"']+/g;

function LinkedText({ value, emptyLabel }) {
  if (!value?.trim()) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const nodes = [];
  let last = 0;
  for (const match of value.matchAll(URL_PATTERN)) {
    const raw = match[0];
    const url = raw.replace(/[),.;]+$/, '');
    const start = match.index ?? 0;
    if (start > last) nodes.push(value.slice(last, start));
    nodes.push(
      <a
        key={`${start}-${url}`}
        href={url}
        target="_blank"
        rel="noreferrer"
        className="break-all underline underline-offset-2"
      >
        {url}
      </a>
    );
    if (raw.length > url.length) nodes.push(raw.slice(url.length));
    last = start + raw.length;
  }
  if (last < value.length) nodes.push(value.slice(last));

  return <p className="whitespace-pre-wrap text-sm leading-relaxed">{nodes}</p>;
}

function ReadField({ label, value, emptyLabel }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <CopyTextButton value={value} label={`Copy ${label}`} />
      </div>
      <LinkedText value={value} emptyLabel={emptyLabel} />
    </div>
  );
}

function EditField({ label, value, placeholder, onChange, tall = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <CopyTextButton value={value} label={`Copy ${label}`} />
      </div>
      <Textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn('text-sm', tall ? 'min-h-40' : 'min-h-20')}
      />
    </div>
  );
}

function OriginalMedia({ videos, instagramLinks, uploads, onFiles, onRemoveVideo, onChangeLinks }) {
  const inputRef = useRef(null);
  const linkRefs = useRef(new Map());
  const [focusLinkId, setFocusLinkId] = useState(null);

  useEffect(() => {
    if (!focusLinkId) return;
    linkRefs.current.get(focusLinkId)?.focus();
    setFocusLinkId(null);
  }, [focusLinkId, instagramLinks]);

  const addLink = () => {
    const id = crypto.randomUUID();
    setFocusLinkId(id);
    onChangeLinks([...instagramLinks, { id, url: '' }], true);
  };

  return (
    <div className="flex flex-col gap-2">
      {videos.map((video) => (
        <div key={video.id} className="relative">
          <video
            src={video.url}
            controls
            playsInline
            preload="metadata"
            className="max-h-80 w-full rounded-lg bg-black"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon-xs"
            className="absolute top-2 right-2"
            aria-label="Delete video"
            title="Delete video"
            onClick={() => onRemoveVideo(video)}
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      {instagramLinks.map((link) => (
        <div key={link.id} className="flex items-center gap-2">
          <Input
            ref={(node) => {
              if (node) linkRefs.current.set(link.id, node);
              else linkRefs.current.delete(link.id);
            }}
            value={link.url}
            placeholder="https://www.instagram.com/..."
            aria-label="Instagram link"
            onChange={(event) =>
              onChangeLinks(
                instagramLinks.map((item) =>
                  item.id === link.id ? { ...item, url: event.target.value } : item
                )
              )
            }
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Delete Instagram link"
            title="Delete Instagram link"
            onClick={() => onChangeLinks(instagramLinks.filter((item) => item.id !== link.id), true)}
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          event.target.value = '';
          if (files.length > 0) onFiles(files);
        }}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <Upload />
          Upload videos
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={addLink}>
          Instagram
        </Button>
      </div>
      {uploads.map((upload) => (
        <UploadProgress
          key={upload.id}
          label={upload.label}
          progress={upload.progress}
          phase={upload.phase}
        />
      ))}
    </div>
  );
}

export default function ViralFormatCard({
  format,
  expanded,
  editing,
  reorderEnabled,
  dragOver,
  uploads,
  confirmDelete,
  onToggle,
  onEditingChange,
  onChange,
  onUpload,
  onRemoveVideo,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onDelete,
}) {
  const title = formatDisplayName(format);
  const hookPreview = format.original.hookCopy?.trim();

  const finishEditing = () => {
    onChange({}, true);
    onEditingChange(false);
  };

  const startEditing = () => {
    if (!expanded) onToggle();
    onEditingChange(true);
  };

  return (
    <article
      className={cn('rounded-xl border bg-card shadow-sm', dragOver && 'ring-2 ring-primary')}
      onDragOver={(event) => {
        if (!reorderEnabled) return;
        event.preventDefault();
        onDragOver(format.id);
      }}
      onDrop={(event) => {
        if (!reorderEnabled) return;
        event.preventDefault();
        onDrop(format.id);
      }}
    >
      <div className="flex items-start gap-2 p-3">
        <div
          draggable={reorderEnabled}
          onDragStart={(event) => {
            if (!reorderEnabled) return;
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', String(format.id));
            onDragStart(format.id);
          }}
          onDragEnd={onDragEnd}
          title={reorderEnabled ? 'Drag to reorder' : 'Clear the search to reorder'}
          className={cn(
            'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground',
            reorderEnabled ? 'cursor-grab hover:bg-muted active:cursor-grabbing' : 'cursor-not-allowed opacity-40'
          )}
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-4" />
        </div>

        <button type="button" onClick={onToggle} className="min-w-0 flex-1 text-left">
          <p className="truncate font-medium">{title}</p>
          {!expanded && hookPreview ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{hookPreview}</p>
          ) : null}
        </button>

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={format.priority ? 'Unmark priority' : 'Mark priority'}
          title={format.priority ? 'Priority format' : 'Mark as priority'}
          onClick={() => onChange({ priority: !format.priority }, true)}
        >
          <Star className={cn('size-4', format.priority && 'fill-current')} />
        </Button>
        {editing ? (
          <Button type="button" variant="outline" size="sm" onClick={finishEditing}>
            <Check />
            Done
          </Button>
        ) : (
          <Button type="button" variant="ghost" size="sm" onClick={startEditing}>
            <Pencil />
            Edit
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={expanded ? 'Collapse format' : 'Expand format'}
          onClick={() => {
            if (expanded && editing) onEditingChange(false);
            onToggle();
          }}
        >
          <ChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} />
        </Button>
      </div>

      {expanded ? (
        <div className="flex flex-col gap-4 border-t px-3 py-4">
          {editing ? (
            <Input
              value={format.appName}
              placeholder="App name"
              aria-label="App name"
              onChange={(event) => onChange({ appName: event.target.value })}
            />
          ) : null}

          <div className="grid gap-3 lg:grid-cols-2">
            <section className="flex flex-col gap-3 rounded-xl border bg-background p-3">
              <h3 className="text-sm font-semibold">Original</h3>
              <OriginalMedia
                videos={format.sampleVideos}
                instagramLinks={format.instagramLinks ?? []}
                uploads={uploads}
                onFiles={onUpload}
                onRemoveVideo={onRemoveVideo}
                onChangeLinks={(links, immediate) => onChange({ instagramLinks: links }, immediate)}
              />
              {editing ? (
                <>
                  <EditField
                    label="Hook copy"
                    value={format.original.hookCopy}
                    placeholder="The original hook line"
                    onChange={(hookCopy) => onChange({ original: { hookCopy } })}
                  />
                  <EditField
                    label="Notes"
                    value={format.original.notes}
                    placeholder="How the video works. Put reference links at the bottom."
                    tall
                    onChange={(notes) => onChange({ original: { notes } })}
                  />
                </>
              ) : (
                <>
                  <ReadField
                    label="Hook copy"
                    value={format.original.hookCopy}
                    emptyLabel="No hook copy yet."
                  />
                  <ReadField
                    label="Notes"
                    value={format.original.notes}
                    emptyLabel="No notes yet."
                  />
                </>
              )}
            </section>

            <section className="flex flex-col gap-3 rounded-xl border bg-background p-3">
              <h3 className="text-sm font-semibold">Smash</h3>
              {editing ? (
                <>
                  <EditField
                    label="Hook copy"
                    value={format.smash.hookCopy}
                    placeholder="The Smash version of the hook"
                    onChange={(hookCopy) => onChange({ smash: { hookCopy } })}
                  />
                  <EditField
                    label="Notes"
                    value={format.smash.notes}
                    placeholder="The Smash version of the video"
                    tall
                    onChange={(notes) => onChange({ smash: { notes } })}
                  />
                </>
              ) : (
                <>
                  <ReadField
                    label="Hook copy"
                    value={format.smash.hookCopy}
                    emptyLabel="No hook copy yet."
                  />
                  <ReadField label="Notes" value={format.smash.notes} emptyLabel="No notes yet." />
                </>
              )}
            </section>
          </div>

          {editing ? (
            <div className="flex justify-end">
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Delete this format?</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(false)}>
                    Cancel
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(true)}>
                    Delete
                  </Button>
                </div>
              ) : (
                <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(false)}>
                  <Trash2 />
                  Delete format
                </Button>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
