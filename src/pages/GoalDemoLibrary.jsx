import { useMemo, useState } from 'react';
import { Eye, Loader2, Upload } from 'lucide-react';
import DataStatus from '@/components/DataStatus';
import UploadProgress from '@/components/showedMe/UploadProgress';
import { DeleteRowButton } from '@/components/table/TableActions';
import { TableInput } from '@/components/table/TableField';
import { Button } from '@/components/ui/button';
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
import { extractFirstVideoFrame } from '@/lib/extractVideoFrame';
import {
  goalDisplayName,
  groupBackgroundsByGoalId,
  libraryEntryHasFiles,
  nextDefaultBackgroundName,
} from '@/lib/goalDemoBackgroundStorage';
import {
  ASSET_TYPE_GOAL_DEMO_LIBRARY_CLIP,
  ASSET_TYPE_GOAL_DEMO_LIBRARY_FRAME,
} from '@/lib/showedMeAssetTypes';
import { deleteShowedMeObject, uploadFileToR2 } from '@/lib/showedMeApi';

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

  const grouped = useMemo(
    () => groupBackgroundsByGoalId(backgrounds.filter(libraryEntryHasFiles), goals),
    [backgrounds, goals]
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

  return (
    <div className="space-y-6 pb-10">
      <p className="text-sm text-muted-foreground">
        Upload demo clips once per goal and background. Showed Me plans reuse these files.
      </p>

      <DataStatus loading={loading} error={error || actionError} />

      <section className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
        <h2 className="text-lg font-semibold">Upload demo</h2>
        <UploadProgress
          label={uploadState?.label}
          progress={uploadState?.progress}
          phase={uploadState?.phase}
        />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="upload-goal">Goal</Label>
            <Select value={uploadGoalId} onValueChange={setUploadGoalId}>
              <SelectTrigger id="upload-goal">
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
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="background-name">Background name (optional)</Label>
            <TableInput
              id="background-name"
              value={backgroundName}
              onChange={(e) => setBackgroundName(e.target.value)}
              placeholder="e.g. white tiles, grey tiles, road, grass"
            />
          </div>
        </div>
        <Label
          className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted ${
            busy === 'upload-library' ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          {busy === 'upload-library' ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          Upload demo video
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
        <p className="text-xs text-muted-foreground">
          First frame is extracted automatically. Files are stored as goal name → background name →
          video / first-frame. Empty names become Background1, Background2, …
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-lg font-semibold">Library by goal</h2>
        {grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground">No demo backgrounds yet.</p>
        ) : (
          grouped.map((group) => (
            <div key={group.goalId} className="space-y-2">
              <h3 className="text-sm font-medium">{group.goalTitle}</h3>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="w-28">First frame</th>
                      <th>Background</th>
                      <th className="w-32">Demo</th>
                      <th className="w-24" aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {group.entries.map((entry) => (
                      <tr key={entry.id}>
                        <td>
                          {entry.framePublicUrl ? (
                            <img
                              src={entry.framePublicUrl}
                              alt=""
                              className="aspect-[9/16] w-16 rounded border object-cover"
                            />
                          ) : null}
                        </td>
                        <td>
                          <TableInput
                            key={`${entry.id}-${entry.backgroundName}`}
                            defaultValue={entry.backgroundName}
                            placeholder="Untitled background"
                            onBlur={(e) => handleSaveName(entry, e.target.value.trim())}
                          />
                        </td>
                        <td>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!entry.demoPublicUrl}
                            onClick={() => setPreviewEntry(entry)}
                          >
                            <Eye className="size-4" />
                            Preview
                          </Button>
                        </td>
                        <td>
                          <DeleteRowButton onClick={() => handleDelete(entry)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </section>

      <Dialog open={Boolean(previewEntry)} onOpenChange={(open) => !open && setPreviewEntry(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
