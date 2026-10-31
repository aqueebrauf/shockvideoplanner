import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import DataStatus from '@/components/DataStatus';
import ViralFormatCard from '@/components/viralFormats/ViralFormatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useViralFormats } from '@/hooks/useViralFormats';
import { deleteShowedMeObject, uploadFileToR2 } from '@/lib/showedMeApi';

function matchesQuery(format, query) {
  if (!query) return true;
  const haystack = [
    format.appName,
    format.original.hookCopy,
    format.original.notes,
    format.smash.hookCopy,
    format.smash.notes,
    ...(format.instagramLinks ?? []).map((link) => link.url),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

export default function ViralFormats() {
  const { formats, loading, error, updateFormat, addFormat, removeFormat, reorderFormats } =
    useViralFormats();
  const [query, setQuery] = useState('');
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [editingIds, setEditingIds] = useState(() => new Set());
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [uploads, setUploads] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [actionError, setActionError] = useState('');

  const normalizedQuery = query.trim().toLowerCase();
  const reorderEnabled = !normalizedQuery && !priorityOnly;

  const visible = useMemo(
    () =>
      formats.filter((format) => {
        if (priorityOnly && !format.priority) return false;
        return matchesQuery(format, normalizedQuery);
      }),
    [formats, normalizedQuery, priorityOnly]
  );

  const toggle = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setConfirmDeleteId(null);
  };

  const setEditing = (id, editing) => {
    setEditingIds((prev) => {
      const next = new Set(prev);
      if (editing) next.add(id);
      else next.delete(id);
      return next;
    });
    if (!editing) setConfirmDeleteId(null);
  };

  const handleCreate = async () => {
    const created = await addFormat();
    if (!created) return;
    setExpandedIds((prev) => new Set(prev).add(created.id));
    setEditingIds((prev) => new Set(prev).add(created.id));
    setPriorityOnly(false);
    setQuery('');
  };

  const handleUpload = async (format, files) => {
    setActionError('');
    for (const file of files) {
      const uploadId = crypto.randomUUID();
      const uploadKey = `${format.id}:${uploadId}`;
      setUploads((prev) => ({
        ...prev,
        [uploadKey]: { id: uploadId, phase: 'presigning', progress: 0, label: `Uploading ${file.name}…` },
      }));
      try {
        const uploaded = await uploadFileToR2({
          file,
          assetType: 'viral_format_sample',
          formatId: format.id,
          onProgress: (progress) => {
            setUploads((prev) => ({
              ...prev,
              [uploadKey]: {
                id: uploadId,
                phase: 'uploading',
                progress,
                label: `Uploading ${file.name}…`,
              },
            }));
          },
        });
        await updateFormat(
          format.id,
          (current) => ({
            sampleVideos: [
              ...current.sampleVideos,
              {
                id: uploadId,
                key: uploaded.storageKey,
                url: uploaded.publicUrl,
                name: file.name,
              },
            ],
          }),
          true
        );
        setUploads((prev) => {
          const next = { ...prev };
          delete next[uploadKey];
          return next;
        });
      } catch (err) {
        setActionError(err.message ?? 'Upload failed.');
        setUploads((prev) => {
          const next = { ...prev };
          delete next[uploadKey];
          return next;
        });
      }
    }
  };

  const handleRemoveVideo = async (format, video) => {
    setActionError('');
    await updateFormat(
      format.id,
      (current) => ({
        sampleVideos: current.sampleVideos.filter((item) => item.id !== video.id),
      }),
      true
    );
    if (video.key) {
      try {
        await deleteShowedMeObject(video.key);
      } catch (err) {
        setActionError(err.message ?? 'Video removed from the card, but the file delete failed.');
      }
    }
  };

  const handleDrop = (targetId) => {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }
    const ids = formats.map((format) => format.id);
    const from = ids.indexOf(draggingId);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) return;
    ids.splice(from, 1);
    ids.splice(to, 0, draggingId);
    reorderFormats(ids);
    setDraggingId(null);
    setDragOverId(null);
  };

  const uploadsFor = (formatId) =>
    Object.entries(uploads)
      .filter(([key]) => key.startsWith(`${formatId}:`))
      .map(([, upload]) => upload);

  return (
    <div className="flex flex-col gap-4">
      <DataStatus loading={loading} error={error || actionError} />
      <p className="text-sm text-muted-foreground">
        Original hook, notes, and sample videos, then a Smash version of the same format.
        Cards open to read. Use Edit to change the text or add videos.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={handleCreate}>
          <Plus />
          Create new format
        </Button>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search apps, hooks, notes"
          aria-label="Search formats"
          className="w-full sm:w-64"
        />
        <Button
          type="button"
          variant={priorityOnly ? 'default' : 'outline'}
          onClick={() => setPriorityOnly((value) => !value)}
        >
          Priority
        </Button>
        <span className="text-sm text-muted-foreground">
          {visible.length} format{visible.length === 1 ? '' : 's'}
        </span>
        {!reorderEnabled ? (
          <span className="text-xs text-muted-foreground">Clear the filter to reorder.</span>
        ) : null}
      </div>

      {loading ? null : visible.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-12 text-center text-sm text-muted-foreground">
          {formats.length === 0
            ? 'No formats yet. Create one to start the library.'
            : 'Nothing matches this search.'}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((format) => (
            <ViralFormatCard
              key={format.id}
              format={format}
              expanded={expandedIds.has(format.id)}
              editing={editingIds.has(format.id)}
              reorderEnabled={reorderEnabled}
              dragOver={dragOverId === format.id && draggingId !== format.id}
              uploads={uploadsFor(format.id)}
              confirmDelete={confirmDeleteId === format.id}
              onToggle={() => toggle(format.id)}
              onEditingChange={(editing) => setEditing(format.id, editing)}
              onChange={(patch, immediate) => updateFormat(format.id, patch, immediate)}
              onUpload={(files) => handleUpload(format, files)}
              onRemoveVideo={(video) => handleRemoveVideo(format, video)}
              onDragStart={setDraggingId}
              onDragEnd={() => {
                setDraggingId(null);
                setDragOverId(null);
              }}
              onDragOver={setDragOverId}
              onDrop={handleDrop}
              onDelete={(confirmed) => {
                if (!confirmed) {
                  setConfirmDeleteId((current) => (current === format.id ? null : format.id));
                  return;
                }
                const keys = format.sampleVideos.map((video) => video.key).filter(Boolean);
                removeFormat(format.id);
                keys.forEach((key) => {
                  deleteShowedMeObject(key).catch(() => {});
                });
                setConfirmDeleteId(null);
                setEditing(format.id, false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
