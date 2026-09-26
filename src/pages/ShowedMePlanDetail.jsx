import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Check, ImagePlus, Loader2, Play, Plus, Trash2, Upload, Video, X } from 'lucide-react';
import AssetThumbnail from '@/components/showedMe/AssetThumbnail';
import DeletePlanButton from '@/components/showedMe/DeletePlanButton';
import ShowedMeSlotAsset from '@/components/showedMe/ShowedMeSlotAsset';
import EditorToggle from '@/components/showedMe/EditorToggle';
import UploadProgress from '@/components/showedMe/UploadProgress';
import DataStatus from '@/components/DataStatus';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { libraryEntryHasFiles, libraryFramePreviewUrl } from '@/lib/goalDemoBackgroundStorage';
import {
  assetHasFile,
  getActiveAssetForType,
  getActivePlanAsset,
  iterationForUpload,
  nextIterationForType,
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
  SINGLE_SLOT_ASSET_TYPES,
  assetTypeLabel,
  WORKFLOW_STATUS_DRAFT,
  WORKFLOW_STATUS_READY,
} from '@/lib/showedMeAssetTypes';
import {
  deleteShowedMeObject,
  estimateGeneration,
  generateHookImage,
  generateHookVideo,
  isPlanScopedStorageKey,
  pollGenerationUntilComplete,
  uploadFileToR2,
} from '@/lib/showedMeApi';
import { findGoal } from '@/lib/planResolvers';
import {
  DEFAULT_IMAGE_ASPECT_RATIO,
  DEFAULT_IMAGE_MODEL_ID,
  DEFAULT_IMAGE_RESOLUTION,
  DEFAULT_VIDEO_DURATION,
  DEFAULT_VIDEO_RESOLUTION,
  IMAGE_MODELS,
  imageModelById,
  resolutionLabel,
} from '../../shared/higgsfieldModels.js';

function formatCredits(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  return amount.toFixed(2).replace(/\.?0+$/, '');
}

function formatUsd(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  return `$${amount.toFixed(2)}`;
}

function ComposerSelect({ value, onValueChange, options, label }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-7 w-auto gap-1 rounded-full px-2.5 text-xs" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function FramePicker({ title, frame, busy, onUpload, onClear }) {
  return (
    <div className="relative">
      {frame?.url ? (
        <div className="relative h-24 w-16 overflow-hidden rounded-lg border bg-muted">
          <img src={frame.url} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            className="absolute top-1 right-1 rounded-full bg-background/90 p-0.5"
            onClick={onClear}
            aria-label={`Remove ${title.toLowerCase()}`}
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <Label className="flex h-24 w-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed bg-muted/40 text-center text-[10px] text-muted-foreground hover:bg-muted">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {title}
          <span className="text-[9px]">Optional</span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUpload(file);
              event.target.value = '';
            }}
          />
        </Label>
      )}
    </div>
  );
}

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
  const [imageModelId, setImageModelId] = useState(DEFAULT_IMAGE_MODEL_ID);
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_IMAGE_ASPECT_RATIO);
  const [resolution, setResolution] = useState(
    () => imageModelById(DEFAULT_IMAGE_MODEL_ID).defaultResolution ?? DEFAULT_IMAGE_RESOLUTION
  );
  const [imageQuality, setImageQuality] = useState(
    () => imageModelById(DEFAULT_IMAGE_MODEL_ID).defaultQuality ?? 'low'
  );
  const [videoDuration, setVideoDuration] = useState(String(DEFAULT_VIDEO_DURATION));
  const [videoResolution, setVideoResolution] = useState(DEFAULT_VIDEO_RESOLUTION);
  const [videoSound, setVideoSound] = useState(false);
  const [startFrame, setStartFrame] = useState(null);
  const [endFrame, setEndFrame] = useState(null);
  const [previewEntry, setPreviewEntry] = useState(null);
  const [generationStatus, setGenerationStatus] = useState('');
  const [imageCost, setImageCost] = useState(null);
  const [videoCost, setVideoCost] = useState(null);
  const submitLock = useRef('');

  const selectedDemo = useMemo(
    () =>
      getActivePlanAsset(assets, numericPlanId, ASSET_TYPE_DEMO_CLIP, plan?.selectedDemoAssetId),
    [assets, numericPlanId, plan?.selectedDemoAssetId]
  );

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
    () =>
      assets.filter(
        (asset) =>
          asset.assetType === ASSET_TYPE_REFERENCE_IMAGE &&
          asset.status === 'active' &&
          asset.generationParams?.role !== 'video-frame'
      ),
    [assets]
  );

  const hookImages = useMemo(
    () =>
      assets
        .filter((asset) => asset.assetType === ASSET_TYPE_HOOK_IMAGE && asset.status === 'active' && asset.publicUrl)
        .sort((a, b) => b.iteration - a.iteration),
    [assets]
  );

  const imageModel = imageModelById(imageModelId);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const estimate = await estimateGeneration({
          kind: 'image',
          modelId: imageModelId,
          prompt: hookImagePrompt.trim() || 'Estimate',
          aspectRatio,
          resolution,
          quality: imageQuality,
          imageUrls: referenceImages.map((asset) => asset.publicUrl).filter(Boolean),
        });
        if (!cancelled) setImageCost(formatUsd(estimate.usd));
      } catch {
        if (!cancelled) setImageCost(null);
      }
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [aspectRatio, hookImagePrompt, imageModelId, imageQuality, referenceImages, resolution]);

  useEffect(() => {
    if (!startFrame?.url) {
      setVideoCost(null);
      return undefined;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const estimate = await estimateGeneration({
          kind: 'video',
          prompt: hookVideoPrompt.trim() || 'Smooth cinematic transition',
          imageUrl: startFrame.url,
          endImageUrl: endFrame?.url || '',
          duration: Number(videoDuration) || DEFAULT_VIDEO_DURATION,
          resolution: videoResolution,
          sound: videoSound ? 'on' : 'off',
        });
        if (!cancelled) setVideoCost(formatCredits(estimate.credits));
      } catch {
        if (!cancelled) setVideoCost(null);
      }
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [endFrame?.url, hookVideoPrompt, startFrame?.url, videoDuration, videoResolution, videoSound]);

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
        const sharedKey =
          asset.storageKey &&
          assets.some(
            (row) => row.id !== asset.id && row.storageKey && row.storageKey === asset.storageKey
          );
        if (asset.storageKey && isPlanScopedStorageKey(asset.storageKey) && !sharedKey) {
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
    [assets, clearPlanSelectionForAsset, plan, reloadAssets, removeAsset]
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
      append = false,
    }) => {
      const currentAssets = assetsRef.current;
      const existing = append ? null : getActiveAssetForType(currentAssets, assetType);
      const iteration = append
        ? nextIterationForType(currentAssets, assetType)
        : iterationForUpload(currentAssets, assetType);

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
        append = false,
        generationParams = {},
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
          append,
          generationParams,
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

  const uploadVideoFrame = useCallback(
    async (file, slot) => {
      const asset = await handleUpload(file, ASSET_TYPE_REFERENCE_IMAGE, {
        autoSelect: false,
        append: true,
        generationParams: { role: 'video-frame', slot },
      });
      if (!asset?.publicUrl) return;
      const frame = { url: asset.publicUrl, label: file.name, assetId: asset.id };
      if (slot === 'start') setStartFrame(frame);
      else setEndFrame(frame);
    },
    [handleUpload]
  );

  const useImageAsReference = useCallback(
    async (asset) => {
      if (!asset?.publicUrl) return;
      const already = referenceImages.some((row) => row.publicUrl === asset.publicUrl);
      if (already) return;
      await createAsset({
        assetType: ASSET_TYPE_REFERENCE_IMAGE,
        storageKey: asset.storageKey,
        publicUrl: asset.publicUrl,
        mimeType: asset.mimeType || 'image/jpeg',
        iteration: nextIterationForType(assetsRef.current, ASSET_TYPE_REFERENCE_IMAGE),
        isSelected: false,
        generationParams: { copiedFromAssetId: asset.id },
      });
    },
    [createAsset, referenceImages]
  );

  const handleGenerateHookImage = useCallback(async () => {
    if (submitLock.current) return;
    if (!hookImagePrompt.trim()) {
      setActionError('Enter a prompt for the hook image.');
      return;
    }
    const model = imageModelById(imageModelId);
    if (!model.aspectRatios.includes(aspectRatio) || !model.resolutions.includes(resolution)) {
      setActionError('Choose an aspect ratio and resolution this model supports.');
      return;
    }
    submitLock.current = 'generate-hook-image';
    setBusy('generate-hook-image');
    setActionError('');
    setGenerationStatus('Submitting to Higgsfield…');
    try {
      const goalId = ensureGoalId();
      const imageUrls = referenceImages.map((asset) => asset.publicUrl).filter(Boolean);
      const { requestId } = await generateHookImage({
        prompt: hookImagePrompt.trim(),
        aspectRatio,
        resolution,
        quality: imageQuality,
        imageUrls,
        modelId: model.id,
        planId: plan.id,
      });
      setGenerationStatus('Generating hook image…');
      const result = await pollGenerationUntilComplete(
        {
          requestId,
          goalId,
          planId: plan.id,
          assetType: ASSET_TYPE_HOOK_IMAGE,
          iteration: nextIterationForType(assetsRef.current, ASSET_TYPE_HOOK_IMAGE),
        },
        { onProgress: (progress) => setGenerationStatus(`Hook image: ${progress.status}`) }
      );
      await persistUploadedAsset({
        assetType: ASSET_TYPE_HOOK_IMAGE,
        storageKey: result.storageKey,
        publicUrl: result.publicUrl,
        mimeType: result.mimeType,
        generationParams: {
          requestId,
          prompt: hookImagePrompt,
          aspectRatio,
          resolution,
          quality: imageQuality,
          modelId: model.id,
          planId: plan.id,
        },
        patchKey: 'selectedHookImageId',
        append: true,
      });
      setGenerationStatus('');
    } catch (err) {
      setActionError(err.message ?? 'Hook image generation failed.');
      setGenerationStatus('');
    } finally {
      submitLock.current = '';
      setBusy('');
    }
  }, [
    aspectRatio,
    ensureGoalId,
    hookImagePrompt,
    imageModelId,
    persistUploadedAsset,
    plan?.id,
    imageQuality,
    referenceImages,
    resolution,
  ]);

  const handleGenerateHookVideo = useCallback(async () => {
    if (submitLock.current) return;
    if (!startFrame?.url) {
      setActionError('Add a start frame before generating the hook video.');
      return;
    }
    submitLock.current = 'generate-hook-video';
    setBusy('generate-hook-video');
    setActionError('');
    setGenerationStatus('Submitting hook video to Kling 3.0…');
    try {
      const goalId = ensureGoalId();
      const { requestId } = await generateHookVideo({
        prompt: hookVideoPrompt.trim() || 'Smooth cinematic transition',
        imageUrl: startFrame.url,
        endImageUrl: endFrame?.url || '',
        duration: Number(videoDuration) || DEFAULT_VIDEO_DURATION,
        resolution: videoResolution,
        sound: videoSound ? 'on' : 'off',
        planId: plan.id,
      });
      setGenerationStatus('Generating hook video…');
      const result = await pollGenerationUntilComplete(
        {
          requestId,
          goalId,
          planId: plan.id,
          assetType: ASSET_TYPE_HOOK_VIDEO,
          iteration: 1,
        },
        { onProgress: (progress) => setGenerationStatus(`Hook video: ${progress.status}`) }
      );
      await persistUploadedAsset({
        assetType: ASSET_TYPE_HOOK_VIDEO,
        storageKey: result.storageKey,
        publicUrl: result.publicUrl,
        mimeType: result.mimeType,
        generationParams: {
          requestId,
          prompt: hookVideoPrompt,
          planId: plan.id,
          modelId: 'kling-3',
          duration: Number(videoDuration) || DEFAULT_VIDEO_DURATION,
          resolution: videoResolution,
          sound: videoSound ? 'on' : 'off',
        },
        patchKey: 'selectedHookVideoId',
      });
      setGenerationStatus('');
    } catch (err) {
      setActionError(err.message ?? 'Hook video generation failed.');
      setGenerationStatus('');
    } finally {
      submitLock.current = '';
      setBusy('');
    }
  }, [
    endFrame?.url,
    ensureGoalId,
    hookVideoPrompt,
    persistUploadedAsset,
    plan?.id,
    startFrame?.url,
    videoDuration,
    videoResolution,
    videoSound,
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
        description="Select the demo clip for this plan, preview it, or add its first frame as the hook video end frame."
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
                  const isEndFrame = endFrame?.libraryId === entry.id;
                  return (
                    <div
                      key={entry.id}
                      className={`rounded-lg border bg-background p-2 ${
                        selected ? 'border-primary ring-2 ring-primary/30' : ''
                      }`}
                    >
                      {entry.framePublicUrl ? (
                        <img
                          src={libraryFramePreviewUrl(entry)}
                          alt=""
                          className="mb-2 aspect-[9/16] w-full rounded object-cover"
                        />
                      ) : null}
                      <p className="truncate text-xs font-medium">
                        {entry.backgroundName?.trim() || 'Untitled background'}
                      </p>
                      {isEndFrame ? (
                        <p className="mt-0.5 text-[10px] text-muted-foreground">End frame</p>
                      ) : null}
                      <div className="mt-2 flex flex-col gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant={selected ? 'default' : 'outline'}
                          className="h-7 w-full px-2 text-xs"
                          disabled={Boolean(busy) || selected}
                          onClick={() => handleSelectLibraryBackground(entry)}
                        >
                          {isSelecting ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : selected ? (
                            <Check className="size-3" />
                          ) : null}
                          {selected ? 'Selected' : 'Select'}
                        </Button>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 flex-1 px-2 text-xs"
                            disabled={!entry.demoPublicUrl}
                            onClick={() => setPreviewEntry(entry)}
                          >
                            <Play className="size-3" />
                            Preview
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 flex-1 px-2 text-xs"
                            disabled={Boolean(busy) || !entry.framePublicUrl}
                            onClick={() => {
                              setEndFrame({
                                url: entry.framePublicUrl,
                                label: entry.backgroundName?.trim() || 'Demo frame',
                                libraryId: entry.id,
                              });
                            }}
                          >
                            Add to video
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </Section>

      <Section
        title="2. Hook image"
        description="Write a prompt, add reference images, and keep each result so you can iterate in this card."
      >
        <div className="rounded-xl border bg-muted/30 p-3">
          {referenceImages.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {referenceImages.map((asset) => (
                <div key={asset.id} className="relative">
                  <img
                    src={asset.publicUrl}
                    alt=""
                    className="h-16 w-12 rounded-md border object-cover"
                  />
                  <button
                    type="button"
                    className="absolute -top-1 -right-1 rounded-full bg-background p-0.5 ring-1 ring-border"
                    disabled={deletingAssetId === asset.id}
                    onClick={() => handleDeleteAsset(asset)}
                    aria-label="Remove reference"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <Textarea
            id="hook-image-prompt"
            value={hookImagePrompt}
            onChange={(e) => setHookImagePrompt(e.target.value)}
            rows={5}
            placeholder="Describe the scene you imagine"
            className="min-h-28 resize-y border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Label className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full border bg-background hover:bg-muted">
              <Plus className="size-3.5" />
              <span className="sr-only">Add reference images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                disabled={Boolean(busy)}
                onChange={async (e) => {
                  const files = [...(e.target.files ?? [])];
                  e.target.value = '';
                  for (const file of files) {
                    await handleUpload(file, ASSET_TYPE_REFERENCE_IMAGE, {
                      autoSelect: false,
                      append: true,
                      skipBusy: true,
                    });
                  }
                }}
              />
            </Label>
            <ComposerSelect
              label="Image model"
              value={imageModelId}
              onValueChange={(value) => {
                const next = imageModelById(value);
                setImageModelId(next.id);
                if (!next.aspectRatios.includes(aspectRatio)) setAspectRatio(next.defaultAspectRatio);
                if (!next.resolutions.includes(resolution)) setResolution(next.defaultResolution);
                if (next.qualities?.length && !next.qualities.includes(imageQuality)) {
                  setImageQuality(next.defaultQuality);
                }
              }}
              options={IMAGE_MODELS.map((model) => ({ value: model.id, label: model.label }))}
            />
            <ComposerSelect
              label="Aspect ratio"
              value={aspectRatio}
              onValueChange={setAspectRatio}
              options={imageModel.aspectRatios.map((value) => ({ value, label: value }))}
            />
            <ComposerSelect
              label="Resolution"
              value={resolution}
              onValueChange={setResolution}
              options={imageModel.resolutions.map((value) => ({
                value,
                label: resolutionLabel(value),
              }))}
            />
            {imageModel.qualities?.length ? (
              <ComposerSelect
                label="Quality"
                value={imageQuality}
                onValueChange={setImageQuality}
                options={imageModel.qualities.map((value) => ({
                  value,
                  label: value.charAt(0).toUpperCase() + value.slice(1),
                }))}
              />
            ) : null}
            <Button
              type="button"
              className="ml-auto"
              disabled={Boolean(busy)}
              onClick={handleGenerateHookImage}
            >
              {busy === 'generate-hook-image' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Generate
            </Button>
            {imageCost ? (
              <span className="text-sm tabular-nums text-muted-foreground">{imageCost}</span>
            ) : null}
          </div>
        </div>

        {hookImages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hook image yet. Each generation stays in this card.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {hookImages.map((asset) => (
              <div key={asset.id} className="space-y-2">
                <AssetThumbnail asset={asset} showControls={false} />
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 flex-1 px-2 text-xs"
                    title="Use as a reference for the next image"
                    onClick={() => useImageAsReference(asset)}
                  >
                    <ImagePlus className="size-3.5" />
                    Use as reference
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    title="Use as the hook video start frame"
                    onClick={() =>
                      setStartFrame({
                        url: asset.publicUrl,
                        label: 'Generated image',
                      })
                    }
                  >
                    <Video className="size-3.5" />
                    <span className="sr-only">Use as start frame</span>
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    disabled={deletingAssetId === asset.id}
                    onClick={() => handleDeleteAsset(asset)}
                  >
                    {deletingAssetId === asset.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                    <span className="sr-only">Remove image</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="3. Hook video"
        description="Kling 3.0. Defaults are 5 seconds, audio off, and 1080p. Set a start frame and an optional end frame."
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

        <div className="rounded-xl border bg-muted/30 p-3">
          <div className="mb-3 flex gap-2">
            <FramePicker
              title="Start frame"
              frame={startFrame}
              busy={busy === 'upload-reference_image'}
              onUpload={(file) => uploadVideoFrame(file, 'start')}
              onClear={() => setStartFrame(null)}
            />
            <FramePicker
              title="End frame"
              frame={endFrame}
              busy={busy === 'upload-reference_image'}
              onUpload={(file) => uploadVideoFrame(file, 'end')}
              onClear={() => setEndFrame(null)}
            />
          </div>
          <Textarea
            id="hook-video-prompt"
            value={hookVideoPrompt}
            onChange={(e) => setHookVideoPrompt(e.target.value)}
            rows={5}
            placeholder="Describe the camera move"
            className="min-h-28 resize-y border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border bg-background px-2.5 py-1 text-xs">Kling 3.0</span>
            <ComposerSelect
              label="Duration"
              value={String(videoDuration)}
              onValueChange={setVideoDuration}
              options={['3', '4', '5', '6', '7', '8', '9', '10', '12', '15'].map((value) => ({
                value,
                label: `${value}s`,
              }))}
            />
            <ComposerSelect
              label="Resolution"
              value={videoResolution}
              onValueChange={setVideoResolution}
              options={[
                { value: '720p', label: '720p' },
                { value: '1080p', label: '1080p' },
                { value: '4k', label: '4K' },
              ]}
            />
            <Button
              type="button"
              size="sm"
              variant={videoSound ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => setVideoSound((on) => !on)}
            >
              Audio {videoSound ? 'on' : 'off'}
            </Button>
            <Button
              type="button"
              className="ml-auto"
              disabled={Boolean(busy)}
              onClick={handleGenerateHookVideo}
            >
              {busy === 'generate-hook-video' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Generate
              {videoCost ? <span className="text-xs opacity-80">{videoCost}</span> : null}
            </Button>
          </div>
        </div>
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

      <Dialog open={Boolean(previewEntry)} onOpenChange={(open) => !open && setPreviewEntry(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="pr-8">
              {previewEntry?.backgroundName?.trim() || 'Demo preview'}
            </DialogTitle>
          </DialogHeader>
          {previewEntry?.demoPublicUrl ? (
            <video
              key={previewEntry.demoPublicUrl}
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
