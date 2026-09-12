import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, RefreshCw, RotateCcw, RotateCw, Sparkles, Upload } from 'lucide-react';
import PersonPlanAssetGrid from '@/components/personVideo/PersonPlanAssetGrid';
import AssetThumbnail from '@/components/personVideo/AssetThumbnail';
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
import { useGoals } from '@/hooks/useGoals';
import { usePersonPlanAssets } from '@/hooks/usePersonPlanAssets';
import { usePersonVideoPlans } from '@/hooks/usePersonVideoPlans';
import {
  extractFirstVideoFrame,
  extractFirstVideoFrameFromUrl,
  rotateImageBlob,
} from '@/lib/extractVideoFrame';
import { nextIterationForType } from '@/lib/personPlanAssetStorage';
import {
  ASSET_TYPE_DEMO_CLIP,
  ASSET_TYPE_DEMO_FIRST_FRAME,
  ASSET_TYPE_HOOK_IMAGE,
  ASSET_TYPE_HOOK_VIDEO,
  ASSET_TYPE_REFERENCE_IMAGE,
  ASSET_STATUS_DELETED,
  HIGGSFIELD_ASPECT_RATIOS,
  HIGGSFIELD_RESOLUTIONS,
  WORKFLOW_STATUS_DRAFT,
  WORKFLOW_STATUS_READY,
} from '@/lib/personVideoAssetTypes';
import {
  deletePersonVideoObject,
  generateHookImage,
  generateHookVideo,
  pollGenerationUntilComplete,
  uploadFileToR2,
} from '@/lib/personVideoApi';
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

export default function PersonVideoPlanDetail() {
  const { planId } = useParams();
  const numericPlanId = Number(planId);
  const { goals } = useGoals();
  const { plans, loading: plansLoading, error: plansError, updatePlan, flushPlan } =
    usePersonVideoPlans();
  const {
    assets,
    loading: assetsLoading,
    error: assetsError,
    createAsset,
    updateAsset,
    removeAsset,
    reload: reloadAssets,
  } = usePersonPlanAssets(numericPlanId);

  const plan = useMemo(
    () => plans.find((row) => row.id === numericPlanId) ?? null,
    [plans, numericPlanId]
  );
  const goal = findGoal(goals, plan?.goalId ?? null);

  const [busy, setBusy] = useState('');
  const [actionError, setActionError] = useState('');
  const [hookImagePrompt, setHookImagePrompt] = useState('');
  const [hookVideoPrompt, setHookVideoPrompt] = useState('Smooth cinematic transition');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [resolution, setResolution] = useState('720p');
  const [generationStatus, setGenerationStatus] = useState('');

  const selectedDemo = assets.find((a) => a.id === plan?.selectedDemoAssetId);
  const selectedHookImage = assets.find((a) => a.id === plan?.selectedHookImageId);
  const selectedHookVideo = assets.find((a) => a.id === plan?.selectedHookVideoId);

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

  const handleDeleteAsset = useCallback(
    async (asset) => {
      setBusy(`delete-${asset.id}`);
      setActionError('');
      try {
        if (asset.storageKey) {
          await deletePersonVideoObject(asset.storageKey);
        }
        await updateAsset(asset.id, { status: ASSET_STATUS_DELETED, isSelected: false });
        const patch = {};
        if (plan.selectedDemoAssetId === asset.id) patch.selectedDemoAssetId = null;
        if (plan.selectedHookImageId === asset.id) patch.selectedHookImageId = null;
        if (plan.selectedHookVideoId === asset.id) patch.selectedHookVideoId = null;
        if (Object.keys(patch).length > 0) {
          updatePlan(plan.id, patch, { immediate: true });
        }
        await reloadAssets();
      } catch (err) {
        setActionError(err.message ?? 'Delete failed.');
      } finally {
        setBusy('');
      }
    },
    [plan, reloadAssets, updateAsset, updatePlan]
  );

  const handleUpload = useCallback(
    async (file, assetType, { parentAssetId = null, autoSelect = true, patchKey = null } = {}) => {
      if (!file || !plan) return null;
      setBusy(`upload-${assetType}`);
      setActionError('');
      try {
        const goalId = ensureGoalId();
        const iteration = nextIterationForType(assets, assetType);
        const uploaded = await uploadFileToR2({
          file,
          goalId,
          planId: plan.id,
          assetType,
          iteration,
        });
        const asset = await createAsset({
          assetType,
          storageKey: uploaded.storageKey,
          publicUrl: uploaded.publicUrl,
          mimeType: uploaded.mimeType,
          iteration,
          isSelected: autoSelect,
          parentAssetId,
        });
        if (autoSelect && patchKey) {
          await selectAssetForPlan(asset, patchKey);
        }
        await reloadAssets();
        return asset;
      } catch (err) {
        setActionError(err.message ?? 'Upload failed.');
        return null;
      } finally {
        setBusy('');
      }
    },
    [assets, createAsset, ensureGoalId, plan, reloadAssets, selectAssetForPlan]
  );

  const uploadDemoFirstFrame = useCallback(
    async (videoFile, demoAssetId) => {
      try {
        const frameBlob = await extractFirstVideoFrame(videoFile);
        const frameFile = new File([frameBlob], 'demo-first-frame.jpg', { type: 'image/jpeg' });
        await handleUpload(frameFile, ASSET_TYPE_DEMO_FIRST_FRAME, {
          parentAssetId: demoAssetId,
          autoSelect: true,
        });
      } catch (err) {
        setActionError(err.message ?? 'Could not extract first frame from demo.');
      }
    },
    [handleUpload]
  );

  const handleReextractFirstFrame = useCallback(async () => {
    if (!selectedDemo?.publicUrl) {
      setActionError('Upload a demo clip first.');
      return;
    }
    setBusy('reextract-frame');
    setActionError('');
    try {
      const frameBlob = await extractFirstVideoFrameFromUrl(selectedDemo.publicUrl);
      const frameFile = new File([frameBlob], 'demo-first-frame.jpg', { type: 'image/jpeg' });
      await handleUpload(frameFile, ASSET_TYPE_DEMO_FIRST_FRAME, {
        parentAssetId: selectedDemo.id,
        autoSelect: true,
      });
    } catch (err) {
      setActionError(err.message ?? 'Could not re-extract first frame from demo.');
    } finally {
      setBusy('');
    }
  }, [handleUpload, selectedDemo]);

  const handleRotateFirstFrame = useCallback(
    async (degrees) => {
      const frame = assets.find(
        (a) => a.assetType === ASSET_TYPE_DEMO_FIRST_FRAME && a.isSelected
      );
      if (!frame?.publicUrl) {
        setActionError('Select a demo first frame to rotate.');
        return;
      }
      setBusy('rotate-frame');
      setActionError('');
      try {
        const response = await fetch(frame.publicUrl);
        if (!response.ok) {
          throw new Error('Could not load the selected first frame.');
        }
        const blob = await response.blob();
        const rotatedBlob = await rotateImageBlob(blob, degrees);
        const frameFile = new File([rotatedBlob], 'demo-first-frame-rotated.jpg', {
          type: 'image/jpeg',
        });
        await handleUpload(frameFile, ASSET_TYPE_DEMO_FIRST_FRAME, {
          parentAssetId: frame.parentAssetId ?? selectedDemo?.id ?? null,
          autoSelect: true,
        });
      } catch (err) {
        setActionError(err.message ?? 'Could not rotate first frame.');
      } finally {
        setBusy('');
      }
    },
    [assets, handleUpload, selectedDemo?.id]
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
      const iteration = nextIterationForType(assets, ASSET_TYPE_HOOK_IMAGE);
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
      const asset = await createAsset({
        assetType: ASSET_TYPE_HOOK_IMAGE,
        storageKey: result.storageKey,
        publicUrl: result.publicUrl,
        mimeType: result.mimeType,
        iteration,
        generationParams: { requestId, prompt: hookImagePrompt, aspectRatio, resolution },
      });
      await selectAssetForPlan(asset, 'selectedHookImageId');
      await reloadAssets();
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
    createAsset,
    ensureGoalId,
    hookImagePrompt,
    plan?.id,
    referenceImages,
    reloadAssets,
    resolution,
    selectAssetForPlan,
  ]);

  const handleGenerateHookVideo = useCallback(async () => {
    const hookImage = selectedHookImage ?? assets.find((a) => a.assetType === ASSET_TYPE_HOOK_IMAGE && a.isSelected);
    const endFrame = assets.find((a) => a.assetType === ASSET_TYPE_DEMO_FIRST_FRAME && a.isSelected);
    if (!hookImage?.publicUrl || !endFrame?.publicUrl) {
      setActionError('Select a hook image and extract the demo first frame first.');
      return;
    }
    setBusy('generate-hook-video');
    setActionError('');
    setGenerationStatus('Submitting hook video to Higgsfield…');
    try {
      const goalId = ensureGoalId();
      const iteration = nextIterationForType(assets, ASSET_TYPE_HOOK_VIDEO);
      const { requestId } = await generateHookVideo({
        prompt: hookVideoPrompt.trim() || 'Smooth cinematic transition',
        imageUrl: hookImage.publicUrl,
        endImageUrl: endFrame.publicUrl,
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
      const asset = await createAsset({
        assetType: ASSET_TYPE_HOOK_VIDEO,
        storageKey: result.storageKey,
        publicUrl: result.publicUrl,
        mimeType: result.mimeType,
        iteration,
        generationParams: { requestId, prompt: hookVideoPrompt },
      });
      await selectAssetForPlan(asset, 'selectedHookVideoId');
      await reloadAssets();
      setGenerationStatus('');
    } catch (err) {
      setActionError(err.message ?? 'Hook video generation failed.');
      setGenerationStatus('');
    } finally {
      setBusy('');
    }
  }, [
    assets,
    createAsset,
    ensureGoalId,
    hookVideoPrompt,
    plan?.id,
    reloadAssets,
    selectAssetForPlan,
    selectedHookImage,
  ]);

  const markReady = async () => {
    if (!selectedHookVideo?.publicUrl || !selectedDemo?.publicUrl) {
      setActionError('Select final hook video and demo clip before marking ready.');
      return;
    }
    updatePlan(plan.id, { workflowStatus: WORKFLOW_STATUS_READY }, { immediate: true });
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
        <Button render={<Link to="/person-video-plans" />}>Back to plans</Button>
      </div>
    );
  }

  const firstFrameSelected = assets.find(
    (a) => a.assetType === ASSET_TYPE_DEMO_FIRST_FRAME && a.isSelected
  );

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={`Person video plan #${plan.id}`}
        description="Upload demo, generate hook assets, write copy, then mark ready for editors."
      />

      <p className="text-sm">
        <Link to="/person-video-plans" className="text-primary underline-offset-4 hover:underline">
          ← All plans
        </Link>
      </p>

      <DataStatus loading={assetsLoading} error={plansError || assetsError || actionError} />

      <Section title="Goal" description="Link this plan to a goal for organization.">
        <div className="max-w-md space-y-2">
          <Label htmlFor="plan-goal">Goal</Label>
          <Select
            value={plan.goalId ? String(plan.goalId) : ''}
            onValueChange={(value) =>
              updatePlan(plan.id, { goalId: value ? Number(value) : null })
            }
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
      </Section>

      <Section title="1. Demo clip" description="Upload the demo reel editors will pair with the hook.">
        <div className="flex flex-wrap gap-3">
          <Label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
            <Upload className="size-4" />
            Upload demo clip
            <input
              type="file"
              accept="video/*"
              className="sr-only"
              disabled={Boolean(busy)}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const asset = await handleUpload(file, ASSET_TYPE_DEMO_CLIP, {
                    patchKey: 'selectedDemoAssetId',
                  });
                  if (asset) {
                    await uploadDemoFirstFrame(file, asset.id);
                  }
                }
                e.target.value = '';
              }}
            />
          </Label>
        </div>
        {selectedDemo ? (
          <div className="max-w-[200px]">
            <AssetThumbnail asset={selectedDemo} selected />
          </div>
        ) : null}
        <PersonPlanAssetGrid
          assets={assets}
          assetType={ASSET_TYPE_DEMO_CLIP}
          selectedAssetId={plan.selectedDemoAssetId}
          onSelect={(asset) => selectAssetForPlan(asset, 'selectedDemoAssetId')}
          onDelete={handleDeleteAsset}
        />
      </Section>

      <Section
        title="2. Demo first frame"
        description="End frame for hook video — extracted free in your browser when you upload a demo. Upload manually if needed."
      >
        <div className="flex flex-wrap gap-3">
          <Label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
            <Upload className="size-4" />
            Upload frame
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={Boolean(busy)}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleUpload(file, ASSET_TYPE_DEMO_FIRST_FRAME, { autoSelect: true });
                }
                e.target.value = '';
              }}
            />
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={Boolean(busy) || !selectedDemo?.publicUrl}
            onClick={handleReextractFirstFrame}
          >
            {busy === 'reextract-frame' ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Re-extract from demo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={Boolean(busy) || !firstFrameSelected?.publicUrl}
            onClick={() => handleRotateFirstFrame(-90)}
          >
            {busy === 'rotate-frame' ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RotateCcw className="size-4" />
            )}
            Rotate left
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={Boolean(busy) || !firstFrameSelected?.publicUrl}
            onClick={() => handleRotateFirstFrame(90)}
          >
            {busy === 'rotate-frame' ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RotateCw className="size-4" />
            )}
            Rotate right
          </Button>
        </div>
        {firstFrameSelected ? (
          <div className="max-w-[200px]">
            <AssetThumbnail asset={firstFrameSelected} selected />
          </div>
        ) : null}
        <PersonPlanAssetGrid
          assets={assets}
          assetType={ASSET_TYPE_DEMO_FIRST_FRAME}
          selectedAssetId={firstFrameSelected?.id}
          onSelect={async (asset) => {
            await Promise.all(
              assets
                .filter(
                  (row) =>
                    row.assetType === ASSET_TYPE_DEMO_FIRST_FRAME && row.isSelected
                )
                .map((row) => updateAsset(row.id, { isSelected: false }))
            );
            await updateAsset(asset.id, { isSelected: true });
          }}
          onDelete={handleDeleteAsset}
        />
      </Section>

      <Section
        title="3. Hook image"
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
              <AssetThumbnail key={asset.id} asset={asset} />
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
          <div className="max-w-[200px]">
            <AssetThumbnail asset={selectedHookImage} selected />
          </div>
        ) : null}

        <PersonPlanAssetGrid
          assets={assets}
          assetType={ASSET_TYPE_HOOK_IMAGE}
          selectedAssetId={plan.selectedHookImageId}
          onSelect={(asset) => selectAssetForPlan(asset, 'selectedHookImageId')}
          onDelete={handleDeleteAsset}
        />
      </Section>

      <Section
        title="4. Hook video"
        description="Upload manually or generate with Higgsfield (hook image → demo first frame)."
      >
        <div className="flex flex-wrap gap-3">
          <Label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
            <Upload className="size-4" />
            Upload hook video
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
          <div className="max-w-[200px]">
            <AssetThumbnail asset={selectedHookVideo} selected />
          </div>
        ) : null}
        <PersonPlanAssetGrid
          assets={assets}
          assetType={ASSET_TYPE_HOOK_VIDEO}
          selectedAssetId={plan.selectedHookVideoId}
          onSelect={(asset) => selectAssetForPlan(asset, 'selectedHookVideoId')}
          onDelete={handleDeleteAsset}
        />
      </Section>

      <Section title="5. Copy" description="Hook text and caption for editors.">
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
        <div className="flex flex-wrap gap-3">
          {plan.workflowStatus === WORKFLOW_STATUS_READY ? (
            <Button type="button" variant="outline" onClick={markDraft}>
              Mark as draft
            </Button>
          ) : (
            <Button type="button" onClick={markReady}>
              Mark ready for editors
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            render={<Link to="/home/person-video-plan" />}
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
