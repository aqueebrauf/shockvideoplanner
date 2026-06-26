import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoalMultiSelect from '../components/GoalMultiSelect';
import { useCtas } from '../hooks/useCtas';
import { useGoals } from '../hooks/useGoals';
import { usePlan } from '../hooks/usePlan';
import { useScreens } from '../hooks/useScreens';
import { DEFAULT_CTA_ID } from '../lib/ctasStorage';
import { normalizeExternalUrl } from '../lib/externalUrl';
import {
  buildPlanScreensFromSequence,
  DEFAULT_SEQUENCE_ID,
  SCREEN_SEQUENCES,
} from '../lib/screenSequences';
import { sortGoalsByRecent } from '../lib/goalDateLabel';

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
      <h2 className="page-title">Generator</h2>
      <p className="page-subtitle">
        Combine a hook, reference video, and goals to draft reel instructions.
        Each selected goal creates its own plan row.
      </p>

      <form className="generator-form" onSubmit={(event) => event.preventDefault()}>
        <div className="form-field">
          <label className="form-label" htmlFor="hook-text">
            Hook text <span className="form-required">*</span>
          </label>
          <textarea
            id="hook-text"
            className="cell-input generator-textarea"
            rows={3}
            placeholder="Opening line or hook for the reel…"
            value={hookText}
            onChange={(event) => setHookText(event.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="reference-link">
            Reference video link
          </label>
          <input
            id="reference-link"
            type="url"
            className="cell-input"
            placeholder="https://"
            value={referenceLink}
            onChange={(event) => setReferenceLink(event.target.value)}
          />
        </div>

        <div className="form-field">
          <span className="form-label" id="goals-label">
            Goals <span className="form-required">*</span>
          </span>
          <GoalMultiSelect
            goals={sortedGoals}
            selectedIds={selectedGoalIds}
            onChange={setSelectedGoalIds}
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="screen-sequence">
            Screen Sequence <span className="form-required">*</span>
          </label>
          <select
            id="screen-sequence"
            className="cell-select generator-select"
            value={selectedSequenceId}
            onChange={(event) => setSelectedSequenceId(event.target.value)}
            required
          >
            {SCREEN_SEQUENCES.map((sequence) => (
              <option key={sequence.id} value={sequence.id}>
                {sequence.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="cta-select">
            CTA
          </label>
          <select
            id="cta-select"
            className="cell-select generator-select"
            value={effectiveCtaId}
            onChange={(event) => setSelectedCtaId(Number(event.target.value))}
            disabled={ctas.length === 0}
          >
            {ctas.length === 0 ? (
              <option value="">Add CTAs in Resources</option>
            ) : (
              ctas.map((cta) => (
                <option key={cta.id} value={cta.id}>
                  {cta.text || `CTA ${cta.id}`}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="custom-instruction">
            Custom instruction
          </label>
          <textarea
            id="custom-instruction"
            className="cell-input generator-textarea"
            rows={4}
            placeholder="Extra notes for tone, pacing, etc."
            value={customInstruction}
            onChange={(event) => setCustomInstruction(event.target.value)}
          />
        </div>

        {error ? <p className="generator-error">{error}</p> : null}

        <button type="button" className="btn-generate" onClick={handleGenerate}>
          Generate
        </button>
      </form>
    </>
  );
}
