import { useState, useEffect } from 'react';
import TranscriptInput from './components/TranscriptInput';
import NotePane from './components/NotePane';
import BillingPane from './components/BillingPane';
import TasksPane from './components/TasksPane';
import PatientSummaryPane from './components/PatientSummaryPane';
import InsightsPane from './components/InsightsPane';
import MemoryTimelinePane from './components/MemoryTimelinePane';
import PatientMemoryPane from './components/PatientMemoryPane';
import {
  loadPatientMemory,
  savePatientMemory,
  loadPatientVisits,
  savePatientVisit,
} from './lib/storage';
import './App.css';

const PATIENT_ID = 'pt-a1b2c3';

function IntroCard() {
  return (
    <div className="placeholder pane">
      <p className="pane-kicker">Workspace preview</p>
      <h2>From transcript to care continuity</h2>
      <p>
        Select a sample visit or paste your own de-identified transcript to
        generate the note, billing suggestions, follow-up tasks, and updated
        patient memory.
      </p>
      <div className="placeholder-grid">
        <div className="placeholder-chip">Clinical note</div>
        <div className="placeholder-chip">Billing review</div>
        <div className="placeholder-chip">Follow-up tasks</div>
        <div className="placeholder-chip">Memory update</div>
      </div>
    </div>
  );
}

function App() {
  const [transcript, setTranscript] = useState('');
  const [deidMap, setDeidMap] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patientWiki, setPatientWiki] = useState(() => loadPatientMemory(PATIENT_ID));
  const [visitTimeline, setVisitTimeline] = useState(() => loadPatientVisits(PATIENT_ID));
  const [visitCount, setVisitCount] = useState(() =>
    loadPatientVisits(PATIENT_ID).length || (loadPatientMemory(PATIENT_ID) ? 1 : 0)
  );
  const [visitRenderKey, setVisitRenderKey] = useState(0);
  const [patientId] = useState(PATIENT_ID);

  const deidEntries = Object.entries(deidMap);
  const hasResult = Boolean(result);

  useEffect(() => {
    if (patientWiki) {
      savePatientMemory(patientId, patientWiki);
    }
  }, [patientWiki, patientId]);

  const handleProcessVisit = async (rawTranscript, deidMapFromInput) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      setDeidMap(deidMapFromInput);

      const response = await fetch('http://localhost:3001/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: rawTranscript,
          patient_names: [],
          patient_wiki: patientWiki,
          patient_session_id: patientId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process visit');
      }

      const data = await response.json();
      setResult(data);
      setPatientWiki(data.wiki_update);
      const nextVisitNumber = visitTimeline.length + 1;
      const visitEntry = {
        id: `${Date.now()}-${nextVisitNumber}`,
        label: `Visit ${nextVisitNumber}`,
        timestampLabel: new Date().toLocaleDateString(),
        summary: data.patient_summary || 'Summary unavailable.',
        insights: data.insights || [],
        conditions: data.wiki_update?.conditions || [],
        medications: data.wiki_update?.medications || [],
        tasks: data.tasks || [],
      };
      setVisitTimeline((prev) => [...prev, visitEntry]);
      savePatientVisit(patientId, visitEntry);
      setVisitCount((prev) => prev + 1);
      setVisitRenderKey((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = (index, updates) => {
    if (!result || !result.tasks) return;

    const updatedTasks = [...result.tasks];
    updatedTasks[index] = {
      ...updatedTasks[index],
      ...updates,
    };

    setResult((prev) => ({
      ...prev,
      tasks: updatedTasks,
    }));
  };

  const handleTaskDelete = (index) => {
    if (!result || !result.tasks) return;

    const updatedTasks = [...result.tasks];
    updatedTasks.splice(index, 1);

    setResult((prev) => ({
      ...prev,
      tasks: updatedTasks,
    }));
  };

  const heroCards = [
    { label: 'Patient', value: patientId },
    { label: 'Visit', value: `#${visitCount + 1}` },
    { label: 'Memory', value: visitTimeline.length ? `${visitTimeline.length} visits` : 'Empty' },
    { label: 'De-id tokens', value: `${deidEntries.length}` },
  ];

  const patientSummaryText = result?.patient_summary || '';
  const patientShareText = [
    patientSummaryText || 'Patient summary not available yet.',
    result?.tasks?.length
      ? `Next steps:\n${result.tasks.map((task) => `- ${task.task} (${task.due})`).join('\n')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const handleCopySummary = async () => {
    if (navigator.clipboard && patientShareText) {
      await navigator.clipboard.writeText(patientShareText);
    }
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Clinical workflow</p>
          <h1>ContinuCare AI</h1>
          <p className="hero-subtitle">
            Close the visit, preserve the context, and carry the patient story forward.
          </p>
        </div>

        <div className="hero-metrics">
          {heroCards.map((card) => (
            <div key={card.label} className="metric-card">
              <span className="metric-label">{card.label}</span>
              <strong className="metric-value">{card.value}</strong>
            </div>
          ))}
        </div>

        <div className="visit-info">
          Live session
          {patientWiki && <span className="memory-pill">Memory loaded</span>}
        </div>
      </header>

      <div className="main-content">
        <div className="left-panel">
          <TranscriptInput
            onProcess={handleProcessVisit}
            onTranscriptChange={setTranscript}
          />

          {transcript && deidEntries.length > 0 && (
            <div className="deid-visualization">
              <div className="pane-kicker">De-identification preview</div>
              <h3>This is what leaves your device</h3>
              <div className="deid-details">
                <span className="deid-count">
                  {deidEntries.length} tokens replaced
                </span>
                {deidEntries.map(([token]) => (
                  <span key={token} className="token-tag">
                    {token}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="right-panel">
          {hasResult ? (
            <>
              <PatientSummaryPane
                patientSummary={result.patient_summary}
                tasks={result.tasks}
                insights={result.insights}
                onCopy={handleCopySummary}
              />
              <InsightsPane insights={result.insights} />
              <NotePane key={`note-${visitRenderKey}`} note={result.note} />
              <BillingPane
                key={`billing-${visitRenderKey}`}
                billingItems={result.billing}
              />
              <TasksPane
                key={`tasks-${visitRenderKey}`}
                tasks={result.tasks}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
              />
              <MemoryTimelinePane timeline={visitTimeline} />
              <PatientMemoryPane wiki={patientWiki} />
            </>
          ) : (
            <IntroCard />
          )}
        </div>
      </div>

      {error && <div className="error-message">Alert: {error}</div>}

      {loading && (
        <div className="loading-indicator">
          Processing visit <span className="loading-dots">...</span>
        </div>
      )}
    </div>
  );
}

export default App;
