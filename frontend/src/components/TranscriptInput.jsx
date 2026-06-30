import { useState } from 'react';
import transcripts from '../data/transcripts';
import { deidentify } from '../lib/deidentify';

const TranscriptInput = ({ onProcess, onTranscriptChange, patientName }) => {
  const [selectedVisit, setSelectedVisit] = useState('');
  const [pastedTranscript, setPastedTranscript] = useState('');
  const [deidMap, setDeidMap] = useState({});
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const activeTranscript = selectedVisit || pastedTranscript;

  const handleVisitChange = (e) => {
    const visit = e.target.value;
    setSelectedVisit(visit);
    setPastedTranscript('');

    if (visit) {
      const patientNames = patientName ? [patientName] : ['Martha Collins'];
      const deidResult = deidentify(transcripts[visit], patientNames);
      setDeidMap(deidResult.map);
      onTranscriptChange(deidResult.clean);
      setError(null);
    } else {
      setDeidMap({});
      onTranscriptChange('');
    }
  };

  const handlePasteChange = (e) => {
    const text = e.target.value;
    setPastedTranscript(text);
    setSelectedVisit('');

    if (text.trim()) {
      const deidResult = deidentify(text, []);
      setDeidMap(deidResult.map);
      onTranscriptChange(deidResult.clean);
      setError(null);
    } else {
      setDeidMap({});
      onTranscriptChange('');
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

  return (
    <div className="transcript-input-section pane">
      <div className="pane-heading">
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
            <option key={visit} value={visit}>{visit}</option>
          ))}
        </select>
      </div>

      <div className="paste-transcript field">
        <label htmlFor="paste-transcript">Or paste transcript</label>
        <textarea
          id="paste-transcript"
          value={pastedTranscript}
          onChange={handlePasteChange}
          placeholder="Paste visit transcript here..."
          rows={8}
          disabled={processing}
        />
      </div>

      <div className="action-buttons">
        <button
          onClick={handleProcessClick}
          disabled={processing || !activeTranscript.trim()}
          className={`process-button ${processing ? 'processing' : ''}`}
        >
          {processing ? 'Processing visit...' : 'Process visit'}
        </button>

        {error && <div className="error-message compact">{error}</div>}
      </div>
    </div>
  );
};

export default TranscriptInput;
