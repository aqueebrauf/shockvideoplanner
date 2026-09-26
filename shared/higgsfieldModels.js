/** Shared Higgsfield model catalog for the Showed Me generator. */

export const DEFAULT_IMAGE_MODEL_ID = 'grok-image-2';
export const DEFAULT_IMAGE_ASPECT_RATIO = '9:16';
export const DEFAULT_IMAGE_RESOLUTION = '2k';

export const DEFAULT_VIDEO_DURATION = 5;
export const DEFAULT_VIDEO_RESOLUTION = '1080p';
export const DEFAULT_VIDEO_SOUND = 'off';

export const IMAGE_MODELS = [
  {
    id: 'grok-image-2',
    label: 'Grok Image 2.0',
    endpoint: 'xai/grok-imagine-image-2.0',
    aspectRatios: ['9:16', '16:9', '1:1', '4:3', '3:4', '3:2', '2:3', '1:2', '2:1', 'auto'],
    resolutions: ['1k', '2k'],
    qualities: ['low', 'medium'],
    defaultAspectRatio: '9:16',
    defaultResolution: '1k',
    defaultQuality: 'low',
    maxReferences: 10,
  },
  {
    id: 'nano-banana-pro',
    label: 'Nano Banana Pro',
    endpoint: 'nano-banana-2',
    aspectRatios: ['9:16', '16:9', '1:1', '4:3', '3:4', '3:2', '2:3', '4:5', '5:4', '21:9'],
    resolutions: ['1k', '2k', '4k'],
    defaultAspectRatio: '9:16',
    defaultResolution: '2k',
    maxReferences: 14,
  },
  {
    id: 'qwen-image-3',
    label: 'Qwen Image 3',
    endpoint: 'alibaba/qwen-image-3/text-to-image',
    editEndpoint: 'alibaba/qwen-image-3/edit',
    aspectRatios: ['9:16', '16:9', '1:1', '4:3', '3:4', '3:2', '2:3', '7:9', '9:7', '21:9'],
    resolutions: ['1k', '2k'],
    defaultAspectRatio: '9:16',
    defaultResolution: '2k',
    maxReferences: 3,
  },
];

export const KLING_VIDEO = {
  id: 'kling-3',
  label: 'Kling 3.0',
  durations: { min: 3, max: 15, default: DEFAULT_VIDEO_DURATION },
  resolutions: [
    { value: '720p', endpoint: 'kling-video/v3.0/std/image-to-video' },
    { value: '1080p', endpoint: 'kling-video/v3.0/pro/image-to-video' },
    { value: '4k', endpoint: 'kling-video/v3.0/4k/image-to-video' },
  ],
};

export function imageModelById(id) {
  return IMAGE_MODELS.find((model) => model.id === id) ?? IMAGE_MODELS[0];
}

export function resolutionLabel(value) {
  if (value === '1k' || value === '2k' || value === '4k') return value.toUpperCase();
  return value;
}

export function klingEndpointForResolution(resolution) {
  const match = KLING_VIDEO.resolutions.find((item) => item.value === resolution);
  return match?.endpoint ?? KLING_VIDEO.resolutions[1].endpoint;
}
