import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import DataStatus from '../../components/DataStatus';
import CopyTextButton from '../../components/CopyTextButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AddRowButton, DeleteRowButton } from '@/components/table/TableActions';
import { TableInput } from '@/components/table/TableField';
import { useHooks } from '../../hooks/useHooks';
import { useVerbatims } from '../../hooks/useVerbatims';
import { generateHooks } from '@/lib/generateHooks';

export default function Hooks() {
  const { hooks, loading, error, updateHook, addHook, deleteHook, reloadHooks } =
    useHooks();
  const { verbatims, reloadVerbatims } = useVerbatims();
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState('');
  const [generateError, setGenerateError] = useState('');

  const pendingVerbatimCount = useMemo(
    () =>
      verbatims.filter(
        (row) => row.status === 'not_started' && row.text?.trim()
      ).length,
    [verbatims]
  );

  const verbatimById = useMemo(
    () => new Map(verbatims.map((row) => [row.id, row])),
    [verbatims]
  );

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateError('');
    setGenerateMessage('');

    try {
      const result = await generateHooks();
      await Promise.all([reloadHooks(), reloadVerbatims()]);
      const count = result.hooks?.length ?? 0;
      setGenerateMessage(
        `Extracted ${count} hook${count === 1 ? '' : 's'} from verbatim #${result.verbatimId}.`
      );
    } catch (err) {
      setGenerateError(err.message ?? 'Hook generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <DataStatus loading={loading} error={error} />
      <p className="mb-3 text-sm text-muted-foreground">
        Catchy opening lines for reels — readable in 1–3 seconds. Add hooks
        manually or generate them from customer verbatims so the copy speaks
        their language. Edits save automatically for the whole team.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={generating || pendingVerbatimCount === 0}
        >
          <Sparkles />
          {generating ? 'Generating…' : 'Generate from verbatims'}
        </Button>
        <span className="text-sm text-muted-foreground">
          {pendingVerbatimCount === 0
            ? 'No verbatims waiting — add verbatims or reset status to "Not started".'
            : `${pendingVerbatimCount} verbatim${pendingVerbatimCount === 1 ? '' : 's'} waiting`}
        </span>
      </div>

      {generateError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{generateError}</AlertDescription>
        </Alert>
      ) : null}

      {generateMessage ? (
        <Alert className="mb-4">
          <AlertDescription>{generateMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>Hook</th>
              <th className="w-48">Source verbatim</th>
              <th className="w-32" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {hooks.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                  No hooks yet. Use &ldquo;Generate from verbatims&rdquo; or
                  &ldquo;Add row&rdquo; below.
                </td>
              </tr>
            ) : (
              hooks.map((row, index) => {
                const source = row.verbatimId
                  ? verbatimById.get(row.verbatimId)
                  : null;

                return (
                  <tr key={row.id}>
                    <td className="text-muted-foreground tabular-nums">
                      {index + 1}
                    </td>
                    <td>
                      <TableInput
                        type="text"
                        value={row.text}
                        placeholder="Hook text"
                        onChange={(e) =>
                          updateHook(row.id, { text: e.target.value })
                        }
                        aria-label={`Hook ${index + 1}`}
                      />
                    </td>
                    <td className="text-sm text-muted-foreground">
                      {source ? (
                        <span
                          className="line-clamp-2"
                          title={source.text}
                        >
                          #{source.id}: {source.text}
                        </span>
                      ) : (
                        <span className="italic">Manual</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <CopyTextButton
                          value={row.text}
                          label={`Copy hook ${index + 1}`}
                        />
                        <DeleteRowButton
                          onClick={() => deleteHook(row.id)}
                          label={`Delete hook ${index + 1}`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <AddRowButton onClick={addHook} />
    </>
  );
}
