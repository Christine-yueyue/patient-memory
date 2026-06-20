import { useState } from 'react';
import transcripts from '../data/transcripts';
import { deidentify } from '../lib/deidentify';

const TranscriptInput = ({ onProcess, onTranscriptChange }) => {
  const [selectedVisit, setSelectedVisit] = useState('');
  const [pastedTranscript, setPastedTranscript] = useState('');
  const [deidMap, setDeidMap] = useState({});
  const [showDeidPreview, setShowDeidPreview] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const activeTranscript = selectedVisit || pastedTranscript;

  const handleVisitChange = (e) => {
    const visit = e.target.value;
    setSelectedVisit(visit);
    setPastedTranscript('');
    setShowDeidPreview(false);

    if (visit) {
      const patientNames = ['Martha Collins'];
      const deidResult = deidentify(transcripts[visit], patientNames);
      setDeidMap(deidResult.map);
      setShowDeidPreview(true);
      onTranscriptChange(deidResult.clean);
      setError(null);
    } else {
      onTranscriptChange('');
      setDeidMap({});
    }
  };

  const handlePasteChange = (e) => {
    const text = e.target.value;
    setPastedTranscript(text);
    setSelectedVisit('');
    setShowDeidPreview(false);

    if (text.trim()) {
      const deidResult = deidentify(text, []);
      setDeidMap(deidResult.map);
      setShowDeidPreview(true);
      onTranscriptChange(deidResult.clean);
      setError(null);
    } else {
      onTranscriptChange('');
      setDeidMap({});
    }
  };

  const handleProcessClick = async () => {
    if (!activeTranscript.trim()) {
      setError('Please select a visit or paste a transcript');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      await onProcess(activeTranscript, deidMap);
    } catch (err) {
      setError(err.message || 'Failed to process visit');
    } finally {
      setProcessing(false);
    }
  };

  const previewSource = selectedVisit || pastedTranscript.substring(0, 120);

  return (
    <div className="transcript-input-section pane">
      <div className="pane-heading">
        <p className="pane-kicker">Input</p>
        <h2>Visit Transcript</h2>
      </div>

      <div className="visit-selector field">
        <label htmlFor="visit-select">Select a sample visit</label>
        <select
          id="visit-select"
          value={selectedVisit}
          onChange={handleVisitChange}
          disabled={processing}
        >
          <option value="">Choose a sample visit</option>
          {Object.keys(transcripts).map((visit) => (
            <option key={visit} value={visit}>
              {visit}
            </option>
          ))}
        </select>
      </div>

      <div className="paste-transcript field">
        <label htmlFor="paste-transcript">Or paste transcript</label>
        <textarea
          id="paste-transcript"
          value={pastedTranscript}
          onChange={handlePasteChange}
          placeholder="Paste de-identified visit transcript here..."
          rows={7}
          disabled={processing}
        />
      </div>

      {showDeidPreview && Object.keys(deidMap).length > 0 && (
        <div className="deid-preview">
          <div className="deid-header">
            <p className="pane-kicker">Privacy check</p>
            <h3>De-identification preview</h3>
            <p className="deid-caption">This is what leaves your device.</p>
          </div>
          <div className="deid-content">
            <strong>Source:</strong> <em>{previewSource || 'Selected sample'}</em>
          </div>
          <div className="deid-tokens">
            <strong>Tokens used:</strong>
            <div className="token-cloud">
              {Object.entries(deidMap).map(([token, original]) => (
                <span key={token} className="token-badge">
                  {token} &lt;- {original}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button
          onClick={handleProcessClick}
          disabled={processing || !activeTranscript.trim()}
          className={`process-button ${processing ? 'processing' : ''}`}
        >
          {processing ? 'Processing visit...' : 'Process visit'}
        </button>

        {error && <div className="error-message compact">Alert: {error}</div>}
      </div>
    </div>
  );
};

export default TranscriptInput;
