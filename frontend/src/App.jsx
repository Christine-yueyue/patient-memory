import { useState, useEffect } from 'react';
import TranscriptInput from './components/TranscriptInput';
import NotePane from './components/NotePane';
import BillingPane from './components/BillingPane';
import TasksPane from './components/TasksPane';
import PatientSummaryPane from './components/PatientSummaryPane';
import InsightsPane from './components/InsightsPane';
import MemoryTimelinePane from './components/MemoryTimelinePane';
import PatientMemoryPane from './components/PatientMemoryPane';
import PrescriptionsPane from './components/PrescriptionsPane';
import RemindersPane from './components/RemindersPane';
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

function calcAge(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return isNaN(age) || age < 0 ? null : age;
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

  // Patient demographics — stored locally, never sent to AI
  const [patientName, setPatientName] = useState('Martha Collins');
  const [patientDOB, setPatientDOB] = useState('1966-01-15');
  const [patientIdNum, setPatientIdNum] = useState('HC-4823917650');
  const [editingDemo, setEditingDemo] = useState(false);

  const patientAge = calcAge(patientDOB);
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
      <nav className="topbar">
        <div className="topbar-brand">
          <span className="topbar-logo">⚕</span>
          <span className="topbar-name">ContinuCare Assistant</span>
        </div>
        <span className="topbar-tag">Ontario Primary Care</span>
      </nav>

      <header className="patient-banner-bar">

        <div className="patient-card">
          {editingDemo ? (
            <div className="patient-demo-edit">
              <label>Name<input value={patientName} onChange={e => setPatientName(e.target.value)} /></label>
              <label>Date of Birth<input type="date" value={patientDOB} onChange={e => setPatientDOB(e.target.value)} /></label>
              <label>Patient ID<input value={patientIdNum} onChange={e => setPatientIdNum(e.target.value)} /></label>
              <button className="btn-edit-demo" onClick={() => setEditingDemo(false)}>Done</button>
            </div>
          ) : (
            <>
              <div className="patient-banner-name">
                {patientName || '—'}
                <button className="btn-edit-demo" onClick={() => setEditingDemo(true)}>Edit</button>
              </div>
              <div className="patient-banner-meta">
                <span><strong>DOB</strong> {patientDOB ? new Date(patientDOB + 'T00:00:00').toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span>
                {patientAge && <span><strong>Age</strong> {patientAge}</span>}
                <span><strong>ID</strong> {patientIdNum || '—'}</span>
                <span className="patient-visit-badge">Visit #{visitCount + 1}{visitTimeline.length > 0 ? ` · ${visitTimeline.length} prior` : ' · New patient'}</span>
              </div>
              {(patientWiki?.conditions?.length > 0 || patientWiki?.medications?.length > 0) && (
                <div className="patient-banner-clinical">
                  {patientWiki?.conditions?.length > 0 && (
                    <span className="banner-clinical-row"><strong>Conditions</strong> {patientWiki.conditions.join(' · ')}</span>
                  )}
                  {patientWiki?.medications?.length > 0 && (
                    <span className="banner-clinical-row"><strong>Medications</strong> {patientWiki.medications.join(' · ')}</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </header>

      <div className="main-content">

        <div className="left-panel">
          <TranscriptInput
            onProcess={handleProcessVisit}
            onTranscriptChange={setTranscript}
          />
        </div>

        <div className="right-panel">
          {hasResult ? (
            <>
              <PatientSummaryPane
                patientSummary={result.patient_summary}
                tasks={result.tasks}
                patientReminders={result.patient_reminders}
                onCopy={handleCopySummary}
              />
              <PrescriptionsPane prescriptions={result.prescriptions} />
              <RemindersPane
                patientReminders={result.patient_reminders}
                doctorReminders={result.doctor_reminders}
              />
              <NotePane key={`note-${visitRenderKey}`} note={result.note} />
              <BillingPane
                key={`billing-${visitRenderKey}`}
                billingItems={result.billing}
              />
              <InsightsPane insights={result.insights} />
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
