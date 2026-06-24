import { useMemo, useState } from 'react';
import GoalMultiSelect from '../components/GoalMultiSelect';
import { useGoals } from '../hooks/useGoals';
import { sortGoalsByRecent } from '../lib/goalDateLabel';

export default function Generator() {
  const { goals } = useGoals();
  const sortedGoals = useMemo(() => sortGoalsByRecent(goals), [goals]);

  const [hookText, setHookText] = useState('');
  const [referenceLink, setReferenceLink] = useState('');
  const [selectedGoalIds, setSelectedGoalIds] = useState([]);
  const [customInstruction, setCustomInstruction] = useState('');

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
          <label className="form-label" htmlFor="custom-instruction">
            Custom instruction
          </label>
          <textarea
            id="custom-instruction"
            className="cell-input generator-textarea"
            rows={4}
            placeholder="Extra notes for tone, pacing, CTA, etc."
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
