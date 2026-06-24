import { useMemo, useState } from 'react';
import GoalMultiSelect from '../components/GoalMultiSelect';
import { useCtas } from '../hooks/useCtas';
import { useGoals } from '../hooks/useGoals';
import { DEFAULT_CTA_ID } from '../lib/ctasStorage';
import { sortGoalsByRecent } from '../lib/goalDateLabel';

function resolveCtaId(ctas, selectedId) {
  if (ctas.some((c) => c.id === selectedId)) return selectedId;
  const linkInBio = ctas.find((c) =>
    c.text.toLowerCase().includes('link in bio')
  );
  return linkInBio?.id ?? ctas[0]?.id ?? '';
}

export default function Generator() {
  const { goals } = useGoals();
  const { ctas } = useCtas();
  const sortedGoals = useMemo(() => sortGoalsByRecent(goals), [goals]);

  const [hookText, setHookText] = useState('');
  const [referenceLink, setReferenceLink] = useState('');
  const [selectedGoalIds, setSelectedGoalIds] = useState([]);
  const [selectedCtaId, setSelectedCtaId] = useState(DEFAULT_CTA_ID);
  const [customInstruction, setCustomInstruction] = useState('');

  const effectiveCtaId = resolveCtaId(ctas, selectedCtaId);

  return (
    <>
      <h2 className="page-title">Generator</h2>
      <p className="page-subtitle">
        Combine a hook, reference video, and goals to draft reel instructions.
      </p>

      <form className="generator-form" onSubmit={(event) => event.preventDefault()}>
        <div className="form-field">
          <label className="form-label" htmlFor="hook-text">
            Hook text
          </label>
          <textarea
            id="hook-text"
            className="cell-input generator-textarea"
            rows={3}
            placeholder="Opening line or hook for the reel…"
            value={hookText}
            onChange={(event) => setHookText(event.target.value)}
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
            Goals
          </span>
          <GoalMultiSelect
            goals={sortedGoals}
            selectedIds={selectedGoalIds}
            onChange={setSelectedGoalIds}
          />
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

        <button type="button" className="btn-generate">
          Generate
        </button>
      </form>
    </>
  );
}
