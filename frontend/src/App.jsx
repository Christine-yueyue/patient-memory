import { useState } from 'react';
import { patients as staticPatients } from './data/patients';
import PatientSelector from './components/PatientSelector';
import PatientStoryPane from './components/PatientStoryPane';
import CarePlanPane from './components/CarePlanPane';
import Dashboard from './components/Dashboard';
import './App.css';

function calcAge(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return isNaN(age) || age < 0 ? null : age;
}

function fmtDate(dob) {
  if (!dob) return '';
  return new Date(dob + 'T00:00:00').toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function loadUploaded() {
  try {
    const raw = localStorage.getItem('uploadedPatients');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function App() {
  const [allPatients, setAllPatients] = useState(() => [...staticPatients, ...loadUploaded()]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [patientStory, setPatientStory] = useState('');
  const [careGaps, setCareGaps] = useState([]);
  const [storyLoading, setStoryLoading] = useState(false);
  const [error, setError] = useState(null);

  const findPatient = (id) => allPatients.find(p => p.id === id) || null;
  const currentPatient = patientData || findPatient(selectedPatientId);
  const patientAge = currentPatient ? calcAge(currentPatient.dob) : null;

  const handlePatientSelect = async (patientId) => {
    setSelectedPatientId(patientId);
    setError(null);

    if (!patientId) {
      setPatientData(null);
      setPatientStory('');
      setCareGaps([]);
      return;
    }

    const patient = findPatient(patientId);
    if (!patient) return;
    setPatientData(patient);
    setStoryLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/load-emr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient),
      });

      if (!response.ok) throw new Error('Failed to load patient story');

      const data = await response.json();
      setPatientStory(data.patient_story);
      setCareGaps(data.care_gaps || []);
    } catch (err) {
      setPatientStory(
        `${patient.name}, age ${patientAge || ''}. ${patient.conditions.length} active conditions. ${
          patient.medications.filter(m => m.status === 'active').length
        } current medications.`
      );
      setCareGaps(patient.careGaps || []);
    } finally {
      setStoryLoading(false);
    }
  };

  const handleUploadEmr = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.name || !data.dob) {
          alert('Invalid EMR format. File must include patient name and dob.');
          return;
        }
        const newPatient = {
          ...data,
          id: data.id || `pt-upload-${Date.now()}`,
          careGaps: data.careGaps || data.care_gaps || [],
        };
        setAllPatients(prev => {
          const updated = [...prev, newPatient];
          const uploaded = updated.filter(p => p.id.startsWith('pt-upload-'));
          localStorage.setItem('uploadedPatients', JSON.stringify(uploaded));
          return updated;
        });
        handlePatientSelect(newPatient.id);
      } catch (err) {
        alert('Failed to parse EMR file. Please upload a valid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <span className="topbar-brand">
          <span className="topbar-dot" />
          ContinuCare
        </span>
        <span className="topbar-tag">Continuity of Care</span>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <PatientSelector
            patients={allPatients}
            selectedPatientId={selectedPatientId}
            onPatientSelect={handlePatientSelect}
            loading={storyLoading}
          />
        </aside>

        <main className="content">
          {storyLoading && <div className="loading">Loading patient story...</div>}

          {!storyLoading && selectedPatientId && currentPatient && (
            <>
              <div className="patient-detail">
                <h1>{currentPatient.name}</h1>
                <div className="patient-meta">
                  <span className="meta-chip">DOB {fmtDate(currentPatient.dob)}</span>
                  <span className="meta-chip">Age {patientAge}</span>
                  <span className="meta-chip">ID {currentPatient.id}</span>
                </div>
                <div className="patient-info-line">
                  <strong>Conditions</strong>
                  {currentPatient.conditions?.map(c => c.name).join(', ') || '—'}
                </div>
                <div className="patient-info-line">
                  <strong>Medications</strong>
                  {currentPatient.medications?.filter(m => m.status === 'active').map(m => m.name).join(', ') || '—'}
                </div>
              </div>

              <PatientStoryPane patientStory={patientStory} loading={false} />
              <CarePlanPane
                tasks={careGaps.map(g => ({
                  task: g.gap,
                  due: g.due || 'asap',
                  status: g.status,
                }))}
              />
            </>
          )}

          {!storyLoading && !selectedPatientId && (
            <Dashboard
              patients={allPatients}
              onPatientSelect={handlePatientSelect}
              onUploadEmr={handleUploadEmr}
            />
          )}
        </main>
      </div>

      {error && <div className="error-bar">Error: {error}</div>}
    </div>
  );
}

export default App;
