import { useEffect, useMemo, useState } from 'react';
import { Download, Loader2, RefreshCw, Trash2, Upload } from 'lucide-react';
import DataStatus from '@/components/DataStatus';
import UploadProgress from '@/components/showedMe/UploadProgress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGoalDemoBackgrounds } from '@/hooks/useGoalDemoBackgrounds';
import { useGoals } from '@/hooks/useGoals';
import { downloadUrlAsFile, fileSafeName, triggerBlobDownload } from '@/lib/downloadFile';
import { extractFirstVideoFrame, extractFirstVideoFrameFromUrl } from '@/lib/extractVideoFrame';
import {
  goalDisplayName,
  groupBackgroundsByGoalId,
  libraryEntryHasFiles,
  libraryFramePreviewUrl,
  nextDefaultBackgroundName,
} from '@/lib/goalDemoBackgroundStorage';
import {
  ASSET_TYPE_GOAL_DEMO_LIBRARY_CLIP,
  ASSET_TYPE_GOAL_DEMO_LIBRARY_FRAME,
} from '@/lib/showedMeAssetTypes';
import { deleteShowedMeObject, uploadFileToR2 } from '@/lib/showedMeApi';
import { cn } from '@/lib/utils';

const FIRST_FRAME_FIX_ID = 't0';
let firstFrameAutoRefreshStarted = false;

function firstFrameFileName(entry, goalTitle) {
  const goal = fileSafeName(goalTitle, `goal-${entry.goalId}`);
  const background = fileSafeName(entry.backgroundName, `background-${entry.id}`);
  return `${goal}-${background}-first-frame.jpg`;
}

function OverlayIconButton({ label, disabled, onClick, children, destructive = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      className={cn(
        'inline-flex size-7 items-center justify-center rounded-md bg-black/70 text-white ring-1 ring-white/30 backdrop-blur-sm transition hover:bg-black/85 disabled:pointer-events-none disabled:opacity-50',
        destructive && 'hover:bg-destructive hover:text-destructive-foreground'
      )}
    >
      {children}
    </button>
  );
}

export default function GoalDemoLibrary() {
  const { goals } = useGoals();
  const {
    backgrounds,
    loading,
    error,
    createBackground,
    updateBackground,
    removeBackground,
    reload,
  } = useGoalDemoBackgrounds();

  const [uploadGoalId, setUploadGoalId] = useState('');
  const [backgroundName, setBackgroundName] = useState('');
  const [busy, setBusy] = useState('');
  const [actionError, setActionError] = useState('');
  const [uploadState, setUploadState] = useState(null);
  const [previewEntry, setPreviewEntry] = useState(null);

  const libraryEntries = useMemo(
    () => backgrounds.filter(libraryEntryHasFiles),
    [backgrounds]
  );

  const grouped = useMemo(
    () => groupBackgroundsByGoalId(libraryEntries, goals),
    [libraryEntries, goals]
  );

  const handleUpload = async (file) => {
    if (!file) return;
    if (!uploadGoalId) {
      setActionError('Select a goal before uploading.');
      return;
    }

    const goalId = Number(uploadGoalId);
    const resolvedGoalName = goalDisplayName(goals, goalId);
    const resolvedBackgroundName =
      backgroundName.trim() || nextDefaultBackgroundName(backgrounds, goalId);

    setBusy('upload-library');
    setActionError('');
    setUploadState({
      phase: 'presigning',
      progress: 0,
      label: `Uploading ${file.name}…`,
    });

    let entry = null;
    const uploadedKeys = [];
    try {
      const demo = await uploadFileToR2({
        file,
        goalId,
        goalName: resolvedGoalName,
        backgroundName: resolvedBackgroundName,
        assetType: ASSET_TYPE_GOAL_DEMO_LIBRARY_CLIP,
        onProgress: (pct) =>
          setUploadState({ phase: 'uploading', progress: pct, label: `Uploading ${file.name}…` }),
      });
      uploadedKeys.push(demo.storageKey);

      setUploadState({ phase: 'extracting', progress: 100, label: 'Extracting first frame…' });

      const frameBlob = await extractFirstVideoFrame(file);
      const frameFile = new File([frameBlob], 'first-frame.jpg', { type: 'image/jpeg' });
      const frame = await uploadFileToR2({
        file: frameFile,
        goalId,
        goalName: resolvedGoalName,
        backgroundName: resolvedBackgroundName,
        assetType: ASSET_TYPE_GOAL_DEMO_LIBRARY_FRAME,
      });
      uploadedKeys.push(frame.storageKey);

      entry = await createBackground({
        goalId,
        backgroundName: resolvedBackgroundName,
        demoStorageKey: demo.storageKey,
        demoPublicUrl: demo.publicUrl,
        demoMimeType: demo.mimeType,
        frameStorageKey: frame.storageKey,
        framePublicUrl: frame.publicUrl,
        frameMimeType: frame.mimeType,
      });

      setUploadState({
        phase: 'done',
        progress: 100,
        label: 'Saved to demo library.',
      });
      setBackgroundName('');
      await reload();
      window.setTimeout(() => setUploadState(null), 4000);
    } catch (err) {
      setActionError(err.message ?? 'Upload failed.');
      setUploadState(null);
      try {
        await Promise.all(uploadedKeys.map((key) => deleteShowedMeObject(key)));
        if (entry?.id) await removeBackground(entry.id);
      } catch {
        // ignore cleanup errors
      }
    } finally {
      setBusy('');
    }
  };

  const handleDelete = async (entry) => {
    setBusy(`delete-${entry.id}`);
    setActionError('');
    try {
      if (entry.demoStorageKey) await deleteShowedMeObject(entry.demoStorageKey);
      if (entry.frameStorageKey) await deleteShowedMeObject(entry.frameStorageKey);
      await removeBackground(entry.id);
    } catch (err) {
      setActionError(err.message ?? 'Delete failed.');
    } finally {
      setBusy('');
    }
  };

  const handleSaveName = async (entry, name) => {
    if (name === entry.backgroundName) return;
    try {
      await updateBackground(entry.id, { backgroundName: name });
    } catch (err) {
      setActionError(err.message ?? 'Could not save background name.');
    }
  };

  const replaceLibraryFrame = async (entry) => {
    const frameBlob = await extractFirstVideoFrameFromUrl(entry.demoPublicUrl);
    const frameFile = new File([frameBlob], 'first-frame.jpg', { type: 'image/jpeg' });
    const frame = await uploadFileToR2({
      file: frameFile,
      goalId: entry.goalId,
      goalName: goalDisplayName(goals, entry.goalId),
      backgroundName: entry.backgroundName?.trim() || `Background${entry.id}`,
      assetType: ASSET_TYPE_GOAL_DEMO_LIBRARY_FRAME,
    });

    await updateBackground(entry.id, {
      frameStorageKey: frame.storageKey,
      framePublicUrl: frame.publicUrl,
      frameMimeType: frame.mimeType,
      updatedAt: new Date().toISOString(),
    });

    if (entry.frameStorageKey && entry.frameStorageKey !== frame.storageKey) {
      try {
        await deleteShowedMeObject(entry.frameStorageKey);
      } catch {
        // keep the new frame even if the old object cannot be removed
      }
    }
  };

  const handleRefreshAllFrames = async () => {
    if (libraryEntries.length === 0) {
      setActionError('No demo clips to re-extract.');
      return;
    }

    setBusy('refresh-frames');
    setActionError('');
    const failures = [];

    try {
      for (let index = 0; index < libraryEntries.length; index += 1) {
        const entry = libraryEntries[index];
        setUploadState({
          phase: 'extracting',
          progress: Math.round((index / libraryEntries.length) * 100),
          label: `Re-extracting first frame ${index + 1}/${libraryEntries.length}…`,
        });
        try {
          await replaceLibraryFrame(entry);
        } catch {
          failures.push(entry.backgroundName?.trim() || `Clip ${entry.id}`);
        }
      }

      setUploadState({
        phase: 'done',
        progress: 100,
        label:
          failures.length === 0
            ? `Updated ${libraryEntries.length} first frames at 0:00:00.`
            : `Updated ${libraryEntries.length - failures.length}/${libraryEntries.length} frames.`,
      });
      if (failures.length > 0) {
        setActionError(`Could not re-extract: ${failures.join(', ')}`);
      } else {
        window.localStorage.setItem('demo-library-frame-extract', FIRST_FRAME_FIX_ID);
      }
      window.setTimeout(() => setUploadState(null), 4000);
    } finally {
      setBusy('');
    }
  };

  useEffect(() => {
    if (loading || firstFrameAutoRefreshStarted) return;
    if (libraryEntries.length === 0) return;
    if (window.localStorage.getItem('demo-library-frame-extract') === FIRST_FRAME_FIX_ID) {
      return;
    }
    firstFrameAutoRefreshStarted = true;
    handleRefreshAllFrames();
  }, [loading, libraryEntries]);

  const handleDownloadFrame = async (entry, goalTitle) => {
    if (!entry.framePublicUrl && !entry.demoPublicUrl) {
      setActionError('No first frame available to download.');
      return;
    }

    setBusy(`download-${entry.id}`);
    setActionError('');
    try {
      const filename = firstFrameFileName(entry, goalTitle);
      if (entry.framePublicUrl) {
        await downloadUrlAsFile(entry.framePublicUrl, filename);
        return;
      }
      const blob = await extractFirstVideoFrameFromUrl(entry.demoPublicUrl);
      triggerBlobDownload(blob, filename);
    } catch (err) {
      if (entry.framePublicUrl) {
        window.open(entry.framePublicUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      setActionError(err.message ?? 'Could not download first frame.');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="space-y-5 pb-10">
      <p className="text-sm text-muted-foreground">
        Upload demo clips once per goal and background. Showed Me plans reuse these files.
      </p>

      <DataStatus loading={loading} error={error || actionError} />

      <section className="space-y-3 rounded-lg border bg-card p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="space-y-1 sm:w-52">
            <Label htmlFor="upload-goal" className="text-xs">
              Goal
            </Label>
            <Select value={uploadGoalId} onValueChange={setUploadGoalId}>
              <SelectTrigger id="upload-goal" className="h-8 w-full">
                <SelectValue placeholder="Select goal" />
              </SelectTrigger>
              <SelectContent>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={String(goal.id)}>
                    {goal.title.trim() || `Goal ${goal.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <Label htmlFor="background-name" className="text-xs">
              Background name
            </Label>
            <Input
              id="background-name"
              value={backgroundName}
              onChange={(e) => setBackgroundName(e.target.value)}
              placeholder="Optional · e.g. white tiles"
            />
          </div>
          <Label
            className={`inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-sm hover:bg-muted ${
              busy === 'upload-library' ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            {busy === 'upload-library' ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            Upload
            <input
              type="file"
              accept="video/*"
              className="sr-only"
              disabled={busy === 'upload-library'}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = '';
              }}
            />
          </Label>
        </div>
        <UploadProgress
          label={uploadState?.label}
          progress={uploadState?.progress}
          phase={uploadState?.phase}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            First frame is taken at 0:00:00. Empty names become Background1, Background2, …
          </p>
          {libraryEntries.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={Boolean(busy)}
              onClick={handleRefreshAllFrames}
            >
              {busy === 'refresh-frames' ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              Re-extract first frames
            </Button>
          ) : null}
        </div>
      </section>

      <section className="space-y-5">
        {grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground">No demo backgrounds yet.</p>
        ) : (
          grouped.map((group) => (
            <div key={group.goalId} className="space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-medium">{group.goalTitle}</h3>
                <p className="text-[11px] text-muted-foreground">
                  {group.entries.length} {group.entries.length === 1 ? 'clip' : 'clips'}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                {group.entries.map((entry) => {
                  const downloading = busy === `download-${entry.id}`;
                  const deleting = busy === `delete-${entry.id}`;
                  return (
                    <div
                      key={entry.id}
                      className="group relative overflow-hidden rounded-md border bg-muted"
                    >
                      <button
                        type="button"
                        className="block w-full text-left"
                        disabled={!entry.demoPublicUrl}
                        onClick={() => setPreviewEntry(entry)}
                        aria-label={`Preview ${entry.backgroundName?.trim() || 'demo'}`}
                      >
                        {entry.framePublicUrl ? (
                          <img
                            src={libraryFramePreviewUrl(entry)}
                            alt=""
                            className="aspect-[9/16] w-full object-cover"
                          />
                        ) : (
                          <div className="flex aspect-[9/16] items-center justify-center text-[10px] text-muted-foreground">
                            No frame
                          </div>
                        )}
                      </button>
                      <div className="absolute top-1 right-1 flex gap-0.5">
                        <OverlayIconButton
                          label="Download first frame"
                          disabled={downloading || (!entry.framePublicUrl && !entry.demoPublicUrl)}
                          onClick={() => handleDownloadFrame(entry, group.goalTitle)}
                        >
                          {downloading ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Download className="size-3.5" />
                          )}
                        </OverlayIconButton>
                        <span className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                          <OverlayIconButton
                            label="Delete demo"
                            destructive
                            disabled={deleting}
                            onClick={() => handleDelete(entry)}
                          >
                            {deleting ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                          </OverlayIconButton>
                        </span>
                      </div>
                      <Input
                        key={`${entry.id}-${entry.backgroundName}`}
                        defaultValue={entry.backgroundName}
                        placeholder="Untitled"
                        className="absolute inset-x-0 bottom-0 h-7 rounded-none border-0 bg-black/55 px-1.5 text-[11px] text-white shadow-none placeholder:text-white/60 focus-visible:ring-0 dark:bg-black/55"
                        onClick={(event) => event.stopPropagation()}
                        onBlur={(e) => handleSaveName(entry, e.target.value.trim())}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>

      <Dialog open={Boolean(previewEntry)} onOpenChange={(open) => !open && setPreviewEntry(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="pr-8">
              {previewEntry?.backgroundName?.trim() || 'Demo preview'}
            </DialogTitle>
          </DialogHeader>
          {previewEntry?.demoPublicUrl ? (
            <video
              src={previewEntry.demoPublicUrl}
              className="aspect-[9/16] w-full rounded-lg bg-black object-contain"
              controls
              autoPlay
              playsInline
            />
          ) : null}
          {previewEntry ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                busy === `download-${previewEntry.id}` ||
                (!previewEntry.framePublicUrl && !previewEntry.demoPublicUrl)
              }
              onClick={() => {
                const group = grouped.find((item) => item.goalId === previewEntry.goalId);
                handleDownloadFrame(previewEntry, group?.goalTitle);
              }}
            >
              {busy === `download-${previewEntry.id}` ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Download className="size-3.5" />
              )}
              Download first frame
            </Button>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
