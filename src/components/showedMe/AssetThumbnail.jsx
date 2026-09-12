import { useState } from 'react';
import {
  ASSET_TYPE_DEMO_CLIP,
  ASSET_TYPE_HOOK_VIDEO,
  isVideoMime,
} from '@/lib/showedMeAssetTypes';
import { cn } from '@/lib/utils';

export default function AssetThumbnail({ asset, selected, onClick, className, showControls = true }) {
  const [loadError, setLoadError] = useState(false);

  if (!asset?.publicUrl) {
    return (
      <div
        className={cn(
          'flex aspect-[9/16] items-center justify-center rounded-lg border bg-muted text-xs text-muted-foreground',
          className
        )}
      >
        No preview
      </div>
    );
  }

  const isVideo =
    isVideoMime(asset.mimeType) ||
    asset.assetType === ASSET_TYPE_DEMO_CLIP ||
    asset.assetType === ASSET_TYPE_HOOK_VIDEO;

  const Wrapper = onClick ? 'button' : 'div';
  const wrapperProps = onClick ? { type: 'button', onClick } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-black/5 text-left transition-colors',
        selected ? 'ring-2 ring-primary border-primary' : onClick ? 'hover:border-primary/50' : '',
        className
      )}
    >
      {loadError ? (
        <div className="flex aspect-[9/16] w-full flex-col items-center justify-center gap-1 bg-muted px-2 text-center text-[10px] text-muted-foreground">
          <span>Preview unavailable</span>
          <span className="break-all opacity-70">Tap to select</span>
        </div>
      ) : isVideo ? (
        <video
          src={asset.publicUrl}
          className="aspect-[9/16] w-full object-cover"
          controls={showControls}
          playsInline
          preload="metadata"
          onError={() => setLoadError(true)}
        />
      ) : (
        <img
          src={asset.publicUrl}
          alt=""
          className="aspect-[9/16] w-full object-cover"
          loading="lazy"
          onError={() => setLoadError(true)}
        />
      )}
      <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
        v{asset.iteration}
      </span>
      {selected ? (
        <span className="absolute top-1 right-1 rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
          Selected
        </span>
      ) : null}
    </Wrapper>
  );
}
