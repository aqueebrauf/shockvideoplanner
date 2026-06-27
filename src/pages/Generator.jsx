import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CharacterMultiSelect from '@/components/CharacterMultiSelect';
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
import { useCaptions } from '@/hooks/useCaptions';
import { useCharacters } from '@/hooks/useCharacters';
import { useCtas } from '@/hooks/useCtas';
import { useGoals } from '@/hooks/useGoals';
import { usePlan } from '@/hooks/usePlan';
import { useScreenSequences } from '@/hooks/useScreenSequences';
import { useScreens } from '@/hooks/useScreens';
import { DEFAULT_CTA_ID } from '@/lib/ctasStorage';
import { normalizeExternalUrl } from '@/lib/externalUrl';
import { generateCaption } from '@/lib/generateCaption';
import { sortGoalsByRecent } from '@/lib/goalDateLabel';
import { resolveCharacterName, resolveGoalTitle } from '@/lib/planResolvers';
import {
  buildPlanScreensFromSequence,
  DEFAULT_SEQUENCE_ID,
} from '@/lib/screenSequences';

export const CAPTION_STYLE_INTELLIGENT = 'intelligent';

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
  const { characters } = useCharacters();
  const { ctas } = useCtas();
  const { captions } = useCaptions();
  const { screens } = useScreens();
  const { screenSequences } = useScreenSequences();
  const { addGeneratedPlans } = usePlan();
  const sortedGoals = useMemo(() => sortGoalsByRecent(goals), [goals]);

  const [hookText, setHookText] = useState('');
  const [referenceLink, setReferenceLink] = useState('');
  const [selectedGoalIds, setSelectedGoalIds] = useState([]);
  const [selectedCharacterIds, setSelectedCharacterIds] = useState([]);
  const [charactersInitialized, setCharactersInitialized] = useState(false);
  const [selectedSequenceId, setSelectedSequenceId] = useState(DEFAULT_SEQUENCE_ID);
  const [selectedCtaId, setSelectedCtaId] = useState(DEFAULT_CTA_ID);
  const [selectedCaptionStyle, setSelectedCaptionStyle] = useState(
    CAPTION_STYLE_INTELLIGENT
  );
  const [customInstruction, setCustomInstruction] = useState('');
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState('');

  const effectiveCtaId = resolveCtaId(ctas, selectedCtaId);
  const selectedCta = ctas.find((cta) => cta.id === effectiveCtaId);

  useEffect(() => {
    if (characters.length === 0 || charactersInitialized) return;

    setSelectedCharacterIds(characters.map((character) => character.id));
    setCharactersInitialized(true);
  }, [characters, charactersInitialized]);

  useEffect(() => {
    if (screenSequences.length === 0) return;
    if (!screenSequences.some((sequence) => sequence.id === selectedSequenceId)) {
      setSelectedSequenceId(screenSequences[0]?.id ?? DEFAULT_SEQUENCE_ID);
    }
  }, [screenSequences, selectedSequenceId]);

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
    if (selectedCharacterIds.length === 0) {
      setError('Select at least one character.');
      return;
    }
    if (!screenSequences.some((sequence) => sequence.id === selectedSequenceId)) {
      setError('Select a screen sequence.');
      return;
    }

    const selectedGoals = selectedGoalIds
      .map((id) => goals.find((goal) => goal.id === id))
      .filter((goal) => goal?.title?.trim());

    const selectedCharacters = selectedCharacterIds
      .map((id) => characters.find((character) => character.id === id))
      .filter((character) => character?.name?.trim());

    if (selectedGoals.length === 0) {
      setError('Selected goals need titles.');
      return;
    }

    if (selectedCharacters.length === 0) {
      setError('Selected characters need names.');
      return;
    }

    setError('');
    setGenerating(true);

    try {
      const generatedRows = [];
      const generationPairs = selectedGoals.flatMap((goal) =>
        selectedCharacters.map((character) => ({ goal, character }))
      );
      const totalRows = generationPairs.length;

      for (let index = 0; index < generationPairs.length; index += 1) {
        const { goal, character } = generationPairs[index];
        const goalTitle = resolveGoalTitle({ goalId: goal.id }, [goal]);
        const characterName = resolveCharacterName({ characterId: character.id }, [character]);
        setGenerateProgress(`Generating caption ${index + 1} of ${totalRows}…`);

        const planScreens = buildPlanScreensFromSequence(
          selectedSequenceId,
          screens,
          screenSequences,
          {
            ctaText: selectedCta?.text ?? '',
            hookText: trimmedHook,
          }
        );

        const captionStyleId =
          selectedCaptionStyle === CAPTION_STYLE_INTELLIGENT
            ? null
            : Number(selectedCaptionStyle);

        const captionStyle =
          selectedCaptionStyle === CAPTION_STYLE_INTELLIGENT
            ? CAPTION_STYLE_INTELLIGENT
            : captions.find((c) => String(c.id) === selectedCaptionStyle)?.style ??
              CAPTION_STYLE_INTELLIGENT;

        const result = await generateCaption({
          hook: trimmedHook,
          goalName: goalTitle,
          characterName,
          screens: planScreens,
          ctaText: selectedCta?.text ?? '',
          captionStyle,
          customInstruction: customInstruction.trim(),
        });

        generatedRows.push({
          screens: planScreens,
          hook: trimmedHook,
          characterId: character.id,
          goalId: goal.id,
          screenSequenceId: selectedSequenceId,
          captionStyleId,
          referenceVideoLink: normalizeExternalUrl(referenceLink),
          caption: result.caption,
          captionStyle: result.captionStyle,
          hashtagsUsed: result.hashtagsUsed,
        });
      }

      const newPlanIds = await addGeneratedPlans(generatedRows);
      navigate('/plan', { state: { highlightId: newPlanIds[0] } });
    } catch (err) {
      setError(err.message || 'Could not generate plan.');
    } finally {
      setGenerating(false);
      setGenerateProgress('');
    }
  };

  return (
    <>
      <PageHeader
        title="Generator"
        description="Combine a hook, reference video, goals, and characters to draft reel instructions. Each selected goal and character creates its own plan row with an AI caption."
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
                disabled={generating}
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
                disabled={generating}
              />
            </div>

            <div className="space-y-2">
              <Label id="characters-label">Characters</Label>
              <CharacterMultiSelect
                characters={characters}
                selectedIds={selectedCharacterIds}
                onChange={setSelectedCharacterIds}
              />
              <p className="text-xs text-muted-foreground">
                All characters are selected by default. Each selected character gets its own plan row.
              </p>
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
                disabled={generating}
              >
                <SelectTrigger id="screen-sequence" className="w-full">
                  <SelectValue placeholder="Select a sequence" />
                </SelectTrigger>
                <SelectContent>
                  {screenSequences.map((sequence) => (
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
                disabled={ctas.length === 0 || generating}
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
              <Label htmlFor="caption-style">Caption style</Label>
              <Select
                value={selectedCaptionStyle}
                onValueChange={setSelectedCaptionStyle}
                disabled={generating}
              >
                <SelectTrigger id="caption-style" className="w-full">
                  <SelectValue placeholder="Select caption style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CAPTION_STYLE_INTELLIGENT}>
                    Intelligent (recommended)
                  </SelectItem>
                  {captions.map((caption) => (
                    <SelectItem key={caption.id} value={String(caption.id)}>
                      {caption.style || `Style ${caption.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Intelligent mode picks the best style for your hook, goal, and CTA.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-instruction">Custom instruction</Label>
              <Textarea
                id="custom-instruction"
                rows={4}
                placeholder="Extra notes for tone, pacing, audience, etc."
                value={customInstruction}
                onChange={(event) => setCustomInstruction(event.target.value)}
                disabled={generating}
              />
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {generateProgress ? (
              <p className="text-sm text-muted-foreground">{generateProgress}</p>
            ) : null}

            <Button type="button" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating…' : 'Generate'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
