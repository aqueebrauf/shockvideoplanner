import { isVideoMime } from '@/lib/personVideoAssetTypes';
import { cn } from '@/lib/utils';

export default function AssetThumbnail({ asset, selected, onClick, className }) {
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

  const isVideo = isVideoMime(asset.mimeType);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-black/5 text-left transition-colors',
        selected ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50',
        className
      )}
    >
      {isVideo ? (
        <video
          src={asset.publicUrl}
          className="aspect-[9/16] w-full object-cover"
          muted
          playsInline
          preload="metadata"
        />
      ) : (
        <img
          src={asset.publicUrl}
          alt=""
          className="aspect-[9/16] w-full object-cover"
          loading="lazy"
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
    </button>
  );
}
