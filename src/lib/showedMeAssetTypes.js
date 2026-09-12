export const ASSET_TYPE_DEMO_CLIP = 'demo_clip';
export const ASSET_TYPE_DEMO_FIRST_FRAME = 'demo_first_frame';
export const ASSET_TYPE_REFERENCE_IMAGE = 'reference_image';
export const ASSET_TYPE_HOOK_IMAGE = 'hook_image';
export const ASSET_TYPE_HOOK_VIDEO = 'hook_video';
export const ASSET_TYPE_GOAL_DEMO_LIBRARY_CLIP = 'goal_demo_library_clip';
export const ASSET_TYPE_GOAL_DEMO_LIBRARY_FRAME = 'goal_demo_library_frame';

export const ASSET_TYPES = [
  ASSET_TYPE_DEMO_CLIP,
  ASSET_TYPE_DEMO_FIRST_FRAME,
  ASSET_TYPE_REFERENCE_IMAGE,
  ASSET_TYPE_HOOK_IMAGE,
  ASSET_TYPE_HOOK_VIDEO,
];

/** One active file per plan — upload/generate replaces instead of adding iterations. */
export const SINGLE_SLOT_ASSET_TYPES = [
  ASSET_TYPE_DEMO_CLIP,
  ASSET_TYPE_DEMO_FIRST_FRAME,
  ASSET_TYPE_HOOK_IMAGE,
  ASSET_TYPE_HOOK_VIDEO,
];

export function isSingleSlotAssetType(assetType) {
  return SINGLE_SLOT_ASSET_TYPES.includes(assetType);
}

export const ASSET_STATUS_ACTIVE = 'active';
export const ASSET_STATUS_DELETED = 'deleted';
export const ASSET_STATUS_GENERATING = 'generating';

export const WORKFLOW_STATUS_DRAFT = 'draft';
export const WORKFLOW_STATUS_READY = 'ready';

export const HIGGSFIELD_ASPECT_RATIOS = ['9:16', '16:9', '4:3', '3:4', '1:1'];
export const HIGGSFIELD_RESOLUTIONS = ['480p', '720p', '1080p'];

export function assetTypeLabel(type) {
  switch (type) {
    case ASSET_TYPE_DEMO_CLIP:
      return 'Demo clip';
    case ASSET_TYPE_DEMO_FIRST_FRAME:
      return 'Demo first frame';
    case ASSET_TYPE_REFERENCE_IMAGE:
      return 'Reference image';
    case ASSET_TYPE_HOOK_IMAGE:
      return 'Hook image';
    case ASSET_TYPE_HOOK_VIDEO:
      return 'Hook video';
    default:
      return type;
  }
}

export function isVideoMime(mimeType) {
  return (mimeType ?? '').startsWith('video/');
}

export function isImageMime(mimeType) {
  return (mimeType ?? '').startsWith('image/');
}
