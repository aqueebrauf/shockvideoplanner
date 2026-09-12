import { Loader2, Trash2 } from 'lucide-react';
import AssetThumbnail from '@/components/personVideo/AssetThumbnail';
import { Button } from '@/components/ui/button';
import { assetTypeLabel } from '@/lib/personVideoAssetTypes';

export default function PersonSlotAsset({
  asset,
  onDelete,
  deleting = false,
  hint,
  className,
}) {
  if (!asset) return null;

  return (
    <div className={className ?? 'max-w-[240px] space-y-2'}>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      <AssetThumbnail asset={asset} selected className="w-full" onClick={undefined} />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        disabled={deleting}
        onClick={() => onDelete?.(asset)}
      >
        {deleting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
        Remove {assetTypeLabel(asset.assetType).toLowerCase()}
      </Button>
    </div>
  );
}
