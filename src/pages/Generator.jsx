import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoalMultiSelect from '@/components/GoalMultiSelect';
import PageHeader from '@/components/layout/PageHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { useCtas } from '@/hooks/useCtas';
import { useGoals } from '@/hooks/useGoals';
import { usePlan } from '@/hooks/usePlan';
import { useScreens } from '@/hooks/useScreens';
import { DEFAULT_CTA_ID } from '@/lib/ctasStorage';
import { normalizeExternalUrl } from '@/lib/externalUrl';
import {
  buildPlanScreensFromSequence,
  DEFAULT_SEQUENCE_ID,
  SCREEN_SEQUENCES,
} from '@/lib/screenSequences';
import { sortGoalsByRecent } from '@/lib/goalDateLabel';

function resolveCtaId(ctas, selectedId) {
  if (ctas.some((c) => c.id === selectedId)) return selectedId;
  const linkInBio = ctas.find((c) =>
    c.text.toLowerCase().includes('link in bio')
  );
  return linkInBio?.id ?? ctas[0]?.id ?? '';
}

export default function Generator() {
  const navigate = useNavigate();
  const { goals } = useGoals();
  const { ctas } = useCtas();
  const { screens } = useScreens();
  const { addGeneratedPlans } = usePlan();
  const sortedGoals = useMemo(() => sortGoalsByRecent(goals), [goals]);

  const [hookText, setHookText] = useState('');
  const [referenceLink, setReferenceLink] = useState('');
  const [selectedGoalIds, setSelectedGoalIds] = useState([]);
  const [selectedSequenceId, setSelectedSequenceId] = useState(DEFAULT_SEQUENCE_ID);
  const [selectedCtaId, setSelectedCtaId] = useState(DEFAULT_CTA_ID);
  const [customInstruction, setCustomInstruction] = useState('');
  const [error, setError] = useState('');

  const effectiveCtaId = resolveCtaId(ctas, selectedCtaId);
  const selectedCta = ctas.find((cta) => cta.id === effectiveCtaId);

  const handleGenerate = async () => {
    const trimmedHook = hookText.trim();
    if (!trimmedHook) {
      setError('Hook text is required.');
      return;
    }
    if (selectedGoalIds.length === 0) {
      setError('Select at least one goal.');
      return;
    }
    if (!SCREEN_SEQUENCES.some((sequence) => sequence.id === selectedSequenceId)) {
      setError('Select a screen sequence.');
      return;
    }

    const selectedGoals = selectedGoalIds
      .map((id) => goals.find((goal) => goal.id === id))
      .filter((goal) => goal?.title?.trim());

    if (selectedGoals.length === 0) {
      setError('Selected goals need titles.');
      return;
    }

    setError('');

    try {
      const generatedRows = selectedGoals.map((goal) => {
        const goalTitle = goal.title.trim();
        const planScreens = buildPlanScreensFromSequence(selectedSequenceId, screens, {
          ctaText: selectedCta?.text ?? '',
          hookText: trimmedHook,
        });

        return {
          screens: planScreens,
          hook: trimmedHook,
          goalName: goalTitle,
          referenceVideoLink: normalizeExternalUrl(referenceLink),
        };
      });

      const newPlanIds = await addGeneratedPlans(generatedRows);

      navigate('/plan', { state: { highlightId: newPlanIds[0] } });
    } catch (err) {
      setError(err.message || 'Could not generate plan.');
    }
  };

  return (
    <>
      <PageHeader
        title="Generator"
        description="Combine a hook, reference video, and goals to draft reel instructions. Each selected goal creates its own plan row."
      />

      <Card className="max-w-2xl">
        <CardContent className="space-y-5 pt-6">
          <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="hook-text">
                Hook text <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="hook-text"
                rows={3}
                placeholder="Opening line or hook for the reel…"
                value={hookText}
                onChange={(event) => setHookText(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference-link">Reference video link</Label>
              <Input
                id="reference-link"
                type="url"
                placeholder="https://"
                value={referenceLink}
                onChange={(event) => setReferenceLink(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label id="goals-label">
                Goals <span className="text-destructive">*</span>
              </Label>
              <GoalMultiSelect
                goals={sortedGoals}
                selectedIds={selectedGoalIds}
                onChange={setSelectedGoalIds}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="screen-sequence">
                Screen sequence <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedSequenceId}
                onValueChange={setSelectedSequenceId}
              >
                <SelectTrigger id="screen-sequence" className="w-full">
                  <SelectValue placeholder="Select a sequence" />
                </SelectTrigger>
                <SelectContent>
                  {SCREEN_SEQUENCES.map((sequence) => (
                    <SelectItem key={sequence.id} value={sequence.id}>
                      {sequence.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta-select">CTA</Label>
              <Select
                value={effectiveCtaId ? String(effectiveCtaId) : undefined}
                onValueChange={(value) => setSelectedCtaId(Number(value))}
                disabled={ctas.length === 0}
              >
                <SelectTrigger id="cta-select" className="w-full">
                  <SelectValue placeholder="Add CTAs in Resources" />
                </SelectTrigger>
                <SelectContent>
                  {ctas.map((cta) => (
                    <SelectItem key={cta.id} value={String(cta.id)}>
                      {cta.text || `CTA ${cta.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-instruction">Custom instruction</Label>
              <Textarea
                id="custom-instruction"
                rows={4}
                placeholder="Extra notes for tone, pacing, etc."
                value={customInstruction}
                onChange={(event) => setCustomInstruction(event.target.value)}
              />
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Button type="button" onClick={handleGenerate}>
              Generate
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
