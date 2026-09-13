import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2, Sparkles, Trash2, Upload } from 'lucide-react';
import AssetThumbnail from '@/components/showedMe/AssetThumbnail';
import DeletePlanButton from '@/components/showedMe/DeletePlanButton';
import ShowedMeSlotAsset from '@/components/showedMe/ShowedMeSlotAsset';
import EditorToggle from '@/components/showedMe/EditorToggle';
import UploadProgress from '@/components/showedMe/UploadProgress';
import DataStatus from '@/components/DataStatus';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCharacters } from '@/hooks/useCharacters';
import { useGoalDemoBackgrounds } from '@/hooks/useGoalDemoBackgrounds';
import { useGoals } from '@/hooks/useGoals';
import { useShowedMePlanAssets } from '@/hooks/useShowedMePlanAssets';
import { useShowedMePlans } from '@/hooks/useShowedMePlans';
import { libraryEntryHasFiles } from '@/lib/goalDemoBackgroundStorage';
import {
  assetHasFile,
  getActiveAssetForType,
  getActivePlanAsset,
  iterationForUpload,
  normalizeShowedMePlanAsset,
  pickSingleSlotKeeper,
} from '@/lib/showedMePlanAssetStorage';
import {
  ASSET_TYPE_DEMO_CLIP,
  ASSET_TYPE_DEMO_FIRST_FRAME,
  ASSET_TYPE_HOOK_IMAGE,
  ASSET_TYPE_HOOK_VIDEO,
  ASSET_TYPE_REFERENCE_IMAGE,
  ASSET_STATUS_ACTIVE,
  HIGGSFIELD_ASPECT_RATIOS,
  SINGLE_SLOT_ASSET_TYPES,
  assetTypeLabel,
  HIGGSFIELD_RESOLUTIONS,
  WORKFLOW_STATUS_DRAFT,
  WORKFLOW_STATUS_READY,
} from '@/lib/showedMeAssetTypes';
import {
  deleteShowedMeObject,
  generateHookImage,
  generateHookVideo,
  isPlanScopedStorageKey,
  pollGenerationUntilComplete,
  uploadFileToR2,
} from '@/lib/showedMeApi';
import { findGoal } from '@/lib/planResolvers';

function Section({ title, description, children }) {
  return (
    <section className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export default function ShowedMePlanDetail() {
  const navigate = useNavigate();
  const { planId } = useParams();
  const numericPlanId = Number(planId);
  const { goals } = useGoals();
  const { characters: editors } = useCharacters();
  const { backgrounds: libraryBackgrounds } = useGoalDemoBackgrounds();
  const { plans, loading: plansLoading, error: plansError, updatePlan, flushPlan } =
    useShowedMePlans();
  const {
    assets,
    loading: assetsLoading,
    error: assetsError,
    createAsset,
    updateAsset,
    saveAsset,
    removeAsset,
    reload: reloadAssets,
  } = useShowedMePlanAssets(numericPlanId);

  const cleanedPlanRef = useRef(null);
  const assetsRef = useRef(assets);
  assetsRef.current = assets;

  useEffect(() => {
    cleanedPlanRef.current = null;
  }, [numericPlanId]);

  const plan = useMemo(
    () => plans.find((row) => row.id === numericPlanId) ?? null,
    [plans, numericPlanId]
  );
  const goal = findGoal(goals, plan?.goalId ?? null);

  const backgroundsForGoal = useMemo(
    () =>
      libraryBackgrounds.filter(
        (entry) => entry.goalId === plan?.goalId && libraryEntryHasFiles(entry)
      ),
    [libraryBackgrounds, plan?.goalId]
  );

  const [busy, setBusy] = useState('');
  const [uploadState, setUploadState] = useState(null);
  const [actionError, setActionError] = useState('');
  const [hookImagePrompt, setHookImagePrompt] = useState('');
  const [hookVideoPrompt, setHookVideoPrompt] = useState('Smooth cinematic transition');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [resolution, setResolution] = useState('720p');
  const [generationStatus, setGenerationStatus] = useState('');

  const selectedDemo = useMemo(
    () =>
      getActivePlanAsset(assets, numericPlanId, ASSET_TYPE_DEMO_CLIP, plan?.selectedDemoAssetId),
    [assets, numericPlanId, plan?.selectedDemoAssetId]
  );

  const firstFrameAsset = useMemo(
    () => getActiveAssetForType(assets, ASSET_TYPE_DEMO_FIRST_FRAME),
    [assets]
  );

  const selectedLibraryEntry = useMemo(
    () => libraryBackgrounds.find((entry) => entry.id === plan?.demoLibraryId) ?? null,
    [libraryBackgrounds, plan?.demoLibraryId]
  );

  const demoEndFrameUrl =
    firstFrameAsset?.publicUrl?.trim() || selectedLibraryEntry?.framePublicUrl?.trim() || '';

  const selectedHookImage = useMemo(
    () =>
      getActivePlanAsset(
        assets,
        numericPlanId,
        ASSET_TYPE_HOOK_IMAGE,
        plan?.selectedHookImageId
      ),
    [assets, numericPlanId, plan?.selectedHookImageId]
  );

  const selectedHookVideo = useMemo(
    () =>
      getActivePlanAsset(
        assets,
        numericPlanId,
        ASSET_TYPE_HOOK_VIDEO,
        plan?.selectedHookVideoId
      ),
    [assets, numericPlanId, plan?.selectedHookVideoId]
  );

  const readyCheck = useMemo(
    () => ({
      demo: assetHasFile(selectedDemo),
      hookVideo: assetHasFile(selectedHookVideo),
    }),
    [selectedDemo, selectedHookVideo]
  );

  const canMarkReady = readyCheck.demo && readyCheck.hookVideo;

  const deletingAssetId = busy.startsWith('delete-')
    ? Number(busy.replace('delete-', ''))
    : null;

  const referenceImages = useMemo(
    () => assets.filter((a) => a.assetType === ASSET_TYPE_REFERENCE_IMAGE && a.status === 'active'),
    [assets]
  );

  const ensureGoalId = useCallback(() => {
    if (!plan?.goalId) {
      throw new Error('Select a goal for this plan first.');
    }
    return plan.goalId;
  }, [plan?.goalId]);

  const selectAssetForPlan = useCallback(
    async (asset, patchKey) => {
      await Promise.all(
        assets
          .filter((row) => row.assetType === asset.assetType && row.isSelected)
          .map((row) => updateAsset(row.id, { isSelected: false }))
      );
      await updateAsset(asset.id, { isSelected: true });
      updatePlan(plan.id, { [patchKey]: asset.id }, { immediate: true });
    },
    [assets, plan?.id, updateAsset, updatePlan]
  );

  const clearPlanSelectionForAsset = useCallback(
    (asset) => {
      const patch = {};
      if (plan.selectedDemoAssetId === asset.id) {
        patch.selectedDemoAssetId = null;
        patch.demoLibraryId = null;
      }
      if (plan.selectedHookImageId === asset.id) patch.selectedHookImageId = null;
      if (plan.selectedHookVideoId === asset.id) patch.selectedHookVideoId = null;
      if (Object.keys(patch).length > 0) {
        updatePlan(plan.id, patch, { immediate: true });
      }
    },
    [plan, updatePlan]
  );

  const handleDeleteAsset = useCallback(
    async (asset) => {
      if (!plan || asset.planId !== plan.id) {
        setActionError('This asset does not belong to the current plan.');
        return;
      }

      setBusy(`delete-${asset.id}`);
      setActionError('');
      try {
        if (asset.storageKey && isPlanScopedStorageKey(asset.storageKey)) {
          await deleteShowedMeObject(asset.storageKey);
        }
        clearPlanSelectionForAsset(asset);
        await removeAsset(asset.id);
        await reloadAssets();
      } catch (err) {
        setActionError(err.message ?? `Could not remove ${assetTypeLabel(asset.assetType).toLowerCase()}.`);
      } finally {
        setBusy('');
      }
    },
    [clearPlanSelectionForAsset, plan, reloadAssets, removeAsset]
  );

  const syncPlanAssetSelections = useCallback(
    (latestAssets) => {
      if (!plan?.id) return;

      const demo = getActivePlanAsset(
        latestAssets,
        plan.id,
        ASSET_TYPE_DEMO_CLIP,
        plan.selectedDemoAssetId
      );
      const hookImage = getActivePlanAsset(
        latestAssets,
        plan.id,
        ASSET_TYPE_HOOK_IMAGE,
        plan.selectedHookImageId
      );
      const hookVideo = getActivePlanAsset(
        latestAssets,
        plan.id,
        ASSET_TYPE_HOOK_VIDEO,
        plan.selectedHookVideoId
      );

      const patch = {};
      if (demo && plan.selectedDemoAssetId !== demo.id) patch.selectedDemoAssetId = demo.id;
      if (hookImage && plan.selectedHookImageId !== hookImage.id) {
        patch.selectedHookImageId = hookImage.id;
      }
      if (hookVideo && plan.selectedHookVideoId !== hookVideo.id) {
        patch.selectedHookVideoId = hookVideo.id;
      }

      if (Object.keys(patch).length > 0) {
        updatePlan(plan.id, patch, { immediate: true });
      }
    },
    [plan, updatePlan]
  );

  const persistUploadedAsset = useCallback(
    async ({
      assetType,
      storageKey,
      publicUrl,
      mimeType,
      parentAssetId = null,
      generationParams = {},
      autoSelect = true,
      patchKey = null,
    }) => {
      const currentAssets = assetsRef.current;
      const existing = getActiveAssetForType(currentAssets, assetType);
      const iteration = iterationForUpload(currentAssets, assetType);

      if (
        existing?.storageKey &&
        existing.storageKey !== storageKey &&
        isPlanScopedStorageKey(existing.storageKey)
      ) {
        await deleteShowedMeObject(existing.storageKey);
      }

      let asset;
      if (existing) {
        asset = await saveAsset(
          normalizeShowedMePlanAsset({
            ...existing,
            assetType,
            storageKey,
            publicUrl,
            mimeType,
            iteration,
            status: ASSET_STATUS_ACTIVE,
            isSelected: autoSelect,
            parentAssetId: parentAssetId ?? existing.parentAssetId ?? null,
            generationParams: generationParams ?? existing.generationParams ?? {},
          })
        );
      } else {
        asset = await createAsset({
          assetType,
          storageKey,
          publicUrl,
          mimeType,
          iteration,
          isSelected: autoSelect,
          parentAssetId,
          generationParams,
        });
      }

      if (autoSelect && patchKey) {
        await selectAssetForPlan(asset, patchKey);
      }

      const latestAssets = await reloadAssets();
      assetsRef.current = latestAssets;
      syncPlanAssetSelections(latestAssets);
      return asset;
    },
    [createAsset, reloadAssets, saveAsset, selectAssetForPlan, syncPlanAssetSelections]
  );

  useEffect(() => {
    if (!plan?.id || assetsLoading || cleanedPlanRef.current === plan.id) return;
    cleanedPlanRef.current = plan.id;

    const selectedByType = {
      [ASSET_TYPE_DEMO_CLIP]: plan.selectedDemoAssetId,
      [ASSET_TYPE_HOOK_IMAGE]: plan.selectedHookImageId,
      [ASSET_TYPE_HOOK_VIDEO]: plan.selectedHookVideoId,
    };

    let cancelled = false;

    (async () => {
      let removedAny = false;

      for (const assetType of SINGLE_SLOT_ASSET_TYPES) {
        const { orphans } = pickSingleSlotKeeper(
          assets,
          assetType,
          selectedByType[assetType] ?? null
        );

        for (const orphan of orphans) {
          if (cancelled) return;
          if (orphan.storageKey && isPlanScopedStorageKey(orphan.storageKey)) {
            await deleteShowedMeObject(orphan.storageKey);
          }
          await removeAsset(orphan.id);
          removedAny = true;
        }
      }

      if (removedAny && !cancelled) {
        await reloadAssets();
      }
    })().catch((err) => {
      if (!cancelled) {
        setActionError(err.message ?? 'Could not clean up duplicate assets.');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [assets, assetsLoading, plan?.id, plan?.selectedDemoAssetId, plan?.selectedHookImageId, plan?.selectedHookVideoId, reloadAssets, removeAsset]);

  const handleUpload = useCallback(
    async (
      file,
      assetType,
      {
        parentAssetId = null,
        autoSelect = true,
        patchKey = null,
        onProgress,
        uploadLabel,
        skipBusy = false,
        skipDoneMessage = false,
      } = {}
    ) => {
      if (!file || !plan) return null;
      if (!skipBusy) setBusy(`upload-${assetType}`);
      setActionError('');
      try {
        const goalId = ensureGoalId();
        const iteration = iterationForUpload(assets, assetType);

        if (uploadLabel) {
          setUploadState({ phase: 'presigning', progress: 0, label: uploadLabel, assetType });
        }

        const uploaded = await uploadFileToR2({
          file,
          goalId,
          planId: plan.id,
          assetType,
          iteration,
          onProgress: (pct) => {
            onProgress?.(pct);
            if (uploadLabel) {
              setUploadState({
                phase: 'uploading',
                progress: pct,
                label: uploadLabel,
                assetType,
              });
            }
          },
        });

        if (uploadLabel) {
          setUploadState({
            phase: 'saving',
            progress: 100,
            label: 'Saving to plan…',
            assetType,
          });
        }

        const asset = await persistUploadedAsset({
          assetType,
          storageKey: uploaded.storageKey,
          publicUrl: uploaded.publicUrl,
          mimeType: uploaded.mimeType,
          parentAssetId,
          autoSelect,
          patchKey,
        });

        if (uploadLabel && !skipDoneMessage) {
          setUploadState({
            phase: 'done',
            progress: 100,
            label: 'Upload complete — preview below.',
            assetType,
          });
          window.setTimeout(() => {
            setUploadState((current) =>
              current?.phase === 'done' && current?.assetType === assetType ? null : current
            );
          }, 4000);
        }

        return asset;
      } catch (err) {
        setActionError(err.message ?? 'Upload failed.');
        if (uploadLabel) setUploadState(null);
        return null;
      } finally {
        if (!skipBusy) setBusy('');
      }
    },
    [assets, ensureGoalId, persistUploadedAsset, plan]
  );

  const handleSelectLibraryBackground = useCallback(
    async (entry) => {
      if (!plan || !libraryEntryHasFiles(entry)) return;

      setBusy(`select-library-${entry.id}`);
      setActionError('');
      try {
        const demoAsset = await persistUploadedAsset({
          assetType: ASSET_TYPE_DEMO_CLIP,
          storageKey: entry.demoStorageKey,
          publicUrl: entry.demoPublicUrl,
          mimeType: entry.demoMimeType,
          autoSelect: true,
          patchKey: 'selectedDemoAssetId',
        });

        await persistUploadedAsset({
          assetType: ASSET_TYPE_DEMO_FIRST_FRAME,
          storageKey: entry.frameStorageKey,
          publicUrl: entry.framePublicUrl,
          mimeType: entry.frameMimeType,
          parentAssetId: demoAsset?.id ?? null,
          autoSelect: true,
        });

        updatePlan(plan.id, { demoLibraryId: entry.id }, { immediate: true });
      } catch (err) {
        setActionError(err.message ?? 'Could not apply demo library background.');
      } finally {
        setBusy('');
      }
    },
    [persistUploadedAsset, plan, updatePlan]
  );

  const handleGenerateHookImage = useCallback(async () => {
    if (!hookImagePrompt.trim()) {
      setActionError('Enter a prompt for the hook image.');
      return;
    }
    setBusy('generate-hook-image');
    setActionError('');
    setGenerationStatus('Submitting to Higgsfield…');
    try {
      const goalId = ensureGoalId();
      const iteration = iterationForUpload(assets, ASSET_TYPE_HOOK_IMAGE);
      const { requestId } = await generateHookImage({
        prompt: hookImagePrompt.trim(),
        aspectRatio,
        resolution,
        imageUrls: referenceImages.map((a) => a.publicUrl).filter(Boolean),
      });
      setGenerationStatus('Generating hook image…');
      const result = await pollGenerationUntilComplete(
        {
          requestId,
          goalId,
          planId: plan.id,
          assetType: ASSET_TYPE_HOOK_IMAGE,
          iteration,
        },
        { onProgress: (p) => setGenerationStatus(`Hook image: ${p.status}`) }
      );
      await persistUploadedAsset({
        assetType: ASSET_TYPE_HOOK_IMAGE,
        storageKey: result.storageKey,
        publicUrl: result.publicUrl,
        mimeType: result.mimeType,
        generationParams: { requestId, prompt: hookImagePrompt, aspectRatio, resolution },
        patchKey: 'selectedHookImageId',
      });
      setGenerationStatus('');
    } catch (err) {
      setActionError(err.message ?? 'Hook image generation failed.');
      setGenerationStatus('');
    } finally {
      setBusy('');
    }
  }, [
    aspectRatio,
    assets,
    ensureGoalId,
    hookImagePrompt,
    persistUploadedAsset,
    plan?.id,
    referenceImages,
    resolution,
  ]);

  const handleGenerateHookVideo = useCallback(async () => {
    const hookImage = selectedHookImage;
    if (!hookImage?.publicUrl || !demoEndFrameUrl) {
      setActionError('Select a hook image and a demo background first.');
      return;
    }
    setBusy('generate-hook-video');
    setActionError('');
    setGenerationStatus('Submitting hook video to Higgsfield…');
    try {
      const goalId = ensureGoalId();
      const iteration = iterationForUpload(assets, ASSET_TYPE_HOOK_VIDEO);
      const { requestId } = await generateHookVideo({
        prompt: hookVideoPrompt.trim() || 'Smooth cinematic transition',
        imageUrl: hookImage.publicUrl,
        endImageUrl: demoEndFrameUrl,
        enhancePrompt: false,
      });
      setGenerationStatus('Generating hook video…');
      const result = await pollGenerationUntilComplete(
        {
          requestId,
          goalId,
          planId: plan.id,
          assetType: ASSET_TYPE_HOOK_VIDEO,
          iteration,
        },
        { onProgress: (p) => setGenerationStatus(`Hook video: ${p.status}`) }
      );
      await persistUploadedAsset({
        assetType: ASSET_TYPE_HOOK_VIDEO,
        storageKey: result.storageKey,
        publicUrl: result.publicUrl,
        mimeType: result.mimeType,
        generationParams: { requestId, prompt: hookVideoPrompt },
        patchKey: 'selectedHookVideoId',
      });
      setGenerationStatus('');
    } catch (err) {
      setActionError(err.message ?? 'Hook video generation failed.');
      setGenerationStatus('');
    } finally {
      setBusy('');
    }
  }, [
    ensureGoalId,
    demoEndFrameUrl,
    hookVideoPrompt,
    persistUploadedAsset,
    plan?.id,
    selectedHookImage,
    assets,
  ]);

  const markReady = async () => {
    setActionError('');
    const latestAssets = await reloadAssets();
    syncPlanAssetSelections(latestAssets);

    const demo = getActivePlanAsset(
      latestAssets,
      plan.id,
      ASSET_TYPE_DEMO_CLIP,
      plan.selectedDemoAssetId
    );
    const hookVideo = getActivePlanAsset(
      latestAssets,
      plan.id,
      ASSET_TYPE_HOOK_VIDEO,
      plan.selectedHookVideoId
    );

    const missing = [];
    if (!assetHasFile(demo)) missing.push('demo clip (section 1 — upload must finish successfully)');
    if (!assetHasFile(hookVideo)) {
      missing.push('hook video (section 4 — upload must finish successfully)');
    }

    if (missing.length > 0) {
      setActionError(`Still missing: ${missing.join('; ')}.`);
      return;
    }

    const patch = { workflowStatus: WORKFLOW_STATUS_READY };
    if (demo.id !== plan.selectedDemoAssetId) patch.selectedDemoAssetId = demo.id;
    if (hookVideo.id !== plan.selectedHookVideoId) patch.selectedHookVideoId = hookVideo.id;

    updatePlan(plan.id, patch, { immediate: true });
    await flushPlan(plan.id);
  };

  const markDraft = () => {
    updatePlan(plan.id, { workflowStatus: WORKFLOW_STATUS_DRAFT }, { immediate: true });
  };

  if (plansLoading && !plan) {
    return <DataStatus loading error={plansError} />;
  }

  if (!plan) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Plan not found.</p>
        <Button render={<Link to="/generator" />}>Back to plans</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={`Showed Me plan #${plan.id}`}
        description="Upload demo, generate hook assets, write copy, then mark ready for editors."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">
          <Link to="/generator" className="text-primary underline-offset-4 hover:underline">
            ← All plans
          </Link>
        </p>
        <DeletePlanButton plan={plan} onDeleted={() => navigate('/generator')} />
      </div>

      <DataStatus loading={assetsLoading} error={plansError || assetsError || actionError} />

      <Section title="Goal & editor" description="Link this plan to a goal and assign it to Aftab or Anni.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="plan-goal">Goal</Label>
            <Select
              value={plan.goalId ? String(plan.goalId) : ''}
              onValueChange={(value) => {
                const nextGoalId = value ? Number(value) : null;
                updatePlan(
                  plan.id,
                  {
                    goalId: nextGoalId,
                    demoLibraryId: nextGoalId === plan.goalId ? plan.demoLibraryId : null,
                  },
                  { immediate: true }
                );
              }}
            >
              <SelectTrigger id="plan-goal">
                <SelectValue placeholder="Select goal">
                  {goal?.title?.trim() || 'Select goal'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {goals.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>
                    {g.title.trim() || `Goal ${g.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Editor</Label>
            <EditorToggle
              editors={editors}
              value={plan.editorId}
              onChange={(next) => {
                updatePlan(
                  plan.id,
                  { editorId: next === 'all' || next == null ? null : Number(next) },
                  { immediate: true }
                );
              }}
            />
          </div>
        </div>
      </Section>

      <Section
        title="1. Demo clip"
        description="Pick a background from the demo library. The first frame is taken from that clip automatically."
      >
        {!plan.goalId ? (
          <p className="text-sm text-muted-foreground">Select a goal above to choose a demo background.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Backgrounds for {goal?.title?.trim() || `goal ${plan.goalId}`}
              </p>
              <Link
                to="/resources/demo-library"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Manage demo library
              </Link>
            </div>
            {backgroundsForGoal.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No backgrounds for this goal yet.{' '}
                <Link to="/resources/demo-library" className="text-primary underline-offset-4 hover:underline">
                  Upload demos in the library
                </Link>
                .
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {backgroundsForGoal.map((entry) => {
                  const selected = plan.demoLibraryId === entry.id;
                  const isSelecting = busy === `select-library-${entry.id}`;
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      disabled={Boolean(busy)}
                      onClick={() => handleSelectLibraryBackground(entry)}
                      className={`rounded-lg border bg-background p-2 text-left transition hover:bg-muted/50 disabled:opacity-50 ${
                        selected ? 'border-primary ring-2 ring-primary/30' : ''
                      }`}
                    >
                      {entry.framePublicUrl ? (
                        <img
                          src={entry.framePublicUrl}
                          alt=""
                          className="mb-2 aspect-[9/16] w-full rounded object-cover"
                        />
                      ) : null}
                      <p className="truncate text-xs font-medium">
                        {entry.backgroundName?.trim() || 'Untitled background'}
                      </p>
                      {isSelecting ? (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Loader2 className="size-3 animate-spin" />
                          Applying…
                        </p>
                      ) : selected ? (
                        <p className="mt-1 text-xs text-primary">Selected</p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {selectedDemo ? (
          <div className="flex flex-wrap items-start gap-4">
            <ShowedMeSlotAsset
              asset={selectedDemo}
              hint="Library clip · first frame is used automatically for hook video"
              deleting={deletingAssetId === selectedDemo.id}
              onDelete={handleDeleteAsset}
            />
            {demoEndFrameUrl ? (
              <div className="max-w-[140px] space-y-2">
                <p className="text-xs text-muted-foreground">End frame from demo</p>
                <img
                  src={demoEndFrameUrl}
                  alt=""
                  className="aspect-[9/16] w-full rounded-lg border object-cover"
                />
              </div>
            ) : null}
          </div>
        ) : plan.goalId ? (
          <p className="text-sm text-muted-foreground">Pick a background above to attach its demo clip.</p>
        ) : null}
      </Section>

      <Section
        title="2. Hook image"
        description="Generate start frame via Higgsfield. Upload reference images optionally."
      >
        <div className="flex flex-wrap gap-3">
          <Label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
            <Upload className="size-4" />
            Reference image
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={Boolean(busy)}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleUpload(file, ASSET_TYPE_REFERENCE_IMAGE, { autoSelect: false });
                }
                e.target.value = '';
              }}
            />
          </Label>
        </div>

        {referenceImages.length > 0 ? (
          <div className="grid grid-cols-4 gap-2 max-w-md">
            {referenceImages.map((asset) => (
              <div key={asset.id} className="space-y-1">
                <AssetThumbnail asset={asset} showControls={false} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 w-full text-xs"
                  disabled={deletingAssetId === asset.id}
                  onClick={() => handleDeleteAsset(asset)}
                >
                  {deletingAssetId === asset.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="hook-image-prompt">Prompt</Label>
            <Textarea
              id="hook-image-prompt"
              value={hookImagePrompt}
              onChange={(e) => setHookImagePrompt(e.target.value)}
              rows={3}
              placeholder="Describe the hook image…"
            />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Aspect ratio</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HIGGSFIELD_ASPECT_RATIOS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Resolution</Label>
              <Select value={resolution} onValueChange={setResolution}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HIGGSFIELD_RESOLUTIONS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button
          type="button"
          disabled={Boolean(busy)}
          onClick={handleGenerateHookImage}
        >
          {busy === 'generate-hook-image' ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          Generate hook image
        </Button>

        {selectedHookImage ? (
          <ShowedMeSlotAsset
            asset={selectedHookImage}
            hint="Generate or upload again to replace"
            deleting={deletingAssetId === selectedHookImage.id}
            onDelete={handleDeleteAsset}
          />
        ) : (
          <p className="text-sm text-muted-foreground">No hook image yet.</p>
        )}
      </Section>

      <Section
        title="3. Hook video"
        description="Upload manually or generate with Higgsfield (hook image → first frame of the selected demo)."
      >
        <UploadProgress
          label={uploadState?.assetType === ASSET_TYPE_HOOK_VIDEO ? uploadState.label : null}
          progress={uploadState?.progress}
          phase={uploadState?.phase}
        />
        <div className="flex flex-wrap gap-3">
          <Label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted ${
              busy === `upload-${ASSET_TYPE_HOOK_VIDEO}` ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            {busy === `upload-${ASSET_TYPE_HOOK_VIDEO}` ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {selectedHookVideo ? 'Replace hook video' : 'Upload hook video'}
            <input
              type="file"
              accept="video/*"
              className="sr-only"
              disabled={Boolean(busy)}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  await handleUpload(file, ASSET_TYPE_HOOK_VIDEO, {
                    patchKey: 'selectedHookVideoId',
                    uploadLabel: `Uploading ${file.name}…`,
                  });
                }
                e.target.value = '';
              }}
            />
          </Label>
        </div>

        <div className="space-y-2 max-w-xl">
          <Label htmlFor="hook-video-prompt">Motion prompt (Higgsfield only)</Label>
          <Input
            id="hook-video-prompt"
            value={hookVideoPrompt}
            onChange={(e) => setHookVideoPrompt(e.target.value)}
          />
        </div>
        <Button type="button" disabled={Boolean(busy)} onClick={handleGenerateHookVideo}>
          {busy === 'generate-hook-video' ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          Generate hook video
        </Button>
        {selectedHookVideo ? (
          <ShowedMeSlotAsset
            asset={selectedHookVideo}
            hint="Use controls to play · uploading again replaces this"
            deleting={deletingAssetId === selectedHookVideo.id}
            onDelete={handleDeleteAsset}
          />
        ) : (
          <p className="text-sm text-muted-foreground">No hook video yet.</p>
        )}
      </Section>

      <Section title="4. Copy" description="Hook text and caption for editors.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="hook-text">Hook text</Label>
            <Textarea
              id="hook-text"
              value={plan.hookText}
              onChange={(e) => updatePlan(plan.id, { hookText: e.target.value })}
              onBlur={() => flushPlan(plan.id)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              value={plan.caption}
              onChange={(e) => updatePlan(plan.id, { caption: e.target.value })}
              onBlur={() => flushPlan(plan.id)}
              rows={3}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="hashtag">Hashtag</Label>
            <Input
              id="hashtag"
              value={plan.hashtag}
              onChange={(e) => updatePlan(plan.id, { hashtag: e.target.value })}
              onBlur={() => flushPlan(plan.id)}
            />
          </div>
        </div>
      </Section>

      <Section title="Publish to editors">
        <ul className="space-y-1 text-sm">
          <li className={readyCheck.demo ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}>
            {readyCheck.demo ? '✓' : '○'} Demo clip uploaded
          </li>
          <li
            className={
              readyCheck.hookVideo ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'
            }
          >
            {readyCheck.hookVideo ? '✓' : '○'} Hook video uploaded
          </li>
        </ul>
        <div className="flex flex-wrap gap-3">
          {plan.workflowStatus === WORKFLOW_STATUS_READY ? (
            <Button type="button" variant="outline" onClick={markDraft}>
              Mark as draft
            </Button>
          ) : (
            <Button type="button" onClick={markReady} disabled={!canMarkReady}>
              Mark ready for editors
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            render={<Link to="/" />}
          >
            Preview editor view
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Status:{' '}
          <strong>
            {plan.workflowStatus === WORKFLOW_STATUS_READY ? 'Ready for editors' : 'Draft'}
          </strong>
        </p>
      </Section>

      {generationStatus ? (
        <p className="text-sm text-muted-foreground">{generationStatus}</p>
      ) : null}
    </div>
  );
}
