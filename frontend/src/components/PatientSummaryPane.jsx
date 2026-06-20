import { useState } from 'react';

const defaultHandoutText = (patientSummary, patientTasks, patientReminders) => [
  'What we discussed today:',
  patientSummary || '',
  '',
  'Your next steps:',
  ...(patientTasks || []).map(t => `• ${t.task} — ${t.due}`),
  '',
  ...(patientReminders?.length ? ['Reminders:', ...(patientReminders || []).map(r => `• ${r}`), ''] : []),
  'Lifestyle recommendations:',
  '• Reduce sodium to less than 2,300 mg per day',
  '• Aim for 30 minutes of moderate exercise most days',
  '• Monitor your blood pressure at home when possible',
  '• Take medications at the same time each day',
  '• Follow up promptly if symptoms worsen',
].join('\n');

const PatientSummaryPane = ({ patientSummary, tasks, patientReminders, onCopy }) => {
  const [handoutState, setHandoutState] = useState('idle'); // idle | confirm | shown
  const [handoutContent, setHandoutContent] = useState('');

  if (!patientSummary && (!tasks || tasks.length === 0)) return null;

  const patientTasks = (tasks || []).filter(t => t.assignee === 'patient' || !t.assignee);

  function openHandout() {
    setHandoutContent(defaultHandoutText(patientSummary, patientTasks, patientReminders));
    setHandoutState('shown');
  }

  async function handleCopy() {
    if (onCopy) await onCopy();
  }

  return (
    <div className="pane summary-pane">
      <div className="pane-heading review-header">
        <div>
          <h2>Plain-Language Summary</h2>
        </div>
        <button className="review-button" onClick={handleCopy}>
          Copy summary
        </button>
      </div>

      <p className="summary-copy">{patientSummary || 'Summary not available.'}</p>

      {patientTasks.length > 0 && (
        <div className="summary-block">
          <h3>Patient next steps</h3>
          <ul className="summary-list">
            {patientTasks.map((task, i) => (
              <li key={i}>{task.task} <span className="task-due-inline">({task.due})</span></li>
            ))}
          </ul>
        </div>
      )}

      <div className="handout-section">
        {handoutState === 'idle' && (
          <button className="btn-handout" onClick={() => setHandoutState('confirm')}>
            Generate Patient Handout
          </button>
        )}

        {handoutState === 'confirm' && (
          <div className="handout-confirm">
            <p>Generate an editable patient handout with next steps and lifestyle recommendations?</p>
            <div className="handout-confirm-actions">
              <button className="review-button" onClick={openHandout}>Yes, generate</button>
              <button className="review-button muted" onClick={() => setHandoutState('idle')}>Cancel</button>
            </div>
          </div>
        )}

        {handoutState === 'shown' && (
          <div className="handout-body">
            <div className="handout-header-row">
              <h3>Patient Handout <span className="handout-edit-hint">— editable</span></h3>
              <div className="handout-actions">
                <button
                  className="review-button"
                  onClick={() => navigator.clipboard.writeText(handoutContent)}
                >
                  Copy
                </button>
                <button
                  className="review-button muted"
                  onClick={() => setHandoutState('idle')}
                >
                  ← Back
                </button>
              </div>
            </div>
            <textarea
              className="handout-editor"
              value={handoutContent}
              onChange={e => setHandoutContent(e.target.value)}
              rows={18}
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientSummaryPane;
