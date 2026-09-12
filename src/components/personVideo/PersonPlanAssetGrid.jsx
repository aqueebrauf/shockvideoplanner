import { Trash2 } from 'lucide-react';
import AssetThumbnail from '@/components/personVideo/AssetThumbnail';
import { Button } from '@/components/ui/button';
import { assetsByType } from '@/lib/personPlanAssetStorage';
import { assetTypeLabel } from '@/lib/personVideoAssetTypes';

export default function PersonPlanAssetGrid({
  assets,
  assetType,
  selectedAssetId,
  onSelect,
  onDelete,
  emptyLabel = 'No assets yet.',
}) {
  const items = assetsByType(assets, assetType);

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {assetTypeLabel(assetType)} iterations
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((asset) => (
          <div key={asset.id} className="space-y-1">
            <AssetThumbnail
              asset={asset}
              selected={selectedAssetId === asset.id}
              onClick={() => onSelect?.(asset)}
            />
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 flex-1 text-xs"
                onClick={() => onSelect?.(asset)}
              >
                {selectedAssetId === asset.id ? 'Selected' : 'Select'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2"
                onClick={() => onDelete?.(asset)}
                aria-label={`Delete iteration ${asset.iteration}`}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
