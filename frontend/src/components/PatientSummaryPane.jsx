import { useState } from 'react';

const PatientSummaryPane = ({ patientSummary, tasks, patientReminders, onCopy }) => {
  const [handoutState, setHandoutState] = useState('idle'); // idle | confirm | shown

  if (!patientSummary && (!tasks || tasks.length === 0)) return null;

  const patientTasks = (tasks || []).filter(t => t.assignee === 'patient' || !t.assignee);

  const handoutText = [
    'PATIENT HANDOUT',
    '',
    'What we discussed today:',
    patientSummary || '',
    '',
    'Your next steps:',
    ...patientTasks.map(t => `• ${t.task} — ${t.due}`),
    '',
    patientReminders?.length ? 'Reminders:' : '',
    ...(patientReminders || []).map(r => `• ${r}`),
    '',
    'Lifestyle recommendations:',
    '• Reduce sodium intake to less than 2,300 mg per day',
    '• Aim for 30 minutes of moderate exercise most days',
    '• Monitor blood pressure at home if possible',
    '• Maintain a consistent medication schedule',
  ].filter(line => line !== undefined).join('\n');

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
            <p>Generate a plain-language handout with next steps and lifestyle recommendations?</p>
            <div className="handout-confirm-actions">
              <button className="review-button" onClick={() => setHandoutState('shown')}>
                Yes, generate
              </button>
              <button className="review-button muted" onClick={() => setHandoutState('idle')}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {handoutState === 'shown' && (
          <div className="handout-body">
            <div className="handout-header-row">
              <h3>Patient Handout</h3>
              <button
                className="review-button muted"
                onClick={() => { navigator.clipboard.writeText(handoutText); }}
              >
                Copy handout
              </button>
            </div>
            <div className="handout-content">
              <div className="handout-block">
                <h4>What we discussed today</h4>
                <p>{patientSummary}</p>
              </div>

              {patientTasks.length > 0 && (
                <div className="handout-block">
                  <h4>Your next steps</h4>
                  <ul className="handout-list">
                    {patientTasks.map((t, i) => (
                      <li key={i}>{t.task} <span className="task-due-inline">— {t.due}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              {patientReminders?.length > 0 && (
                <div className="handout-block">
                  <h4>Reminders</h4>
                  <ul className="handout-list">
                    {patientReminders.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}

              <div className="handout-block">
                <h4>Lifestyle Recommendations</h4>
                <ul className="handout-list">
                  <li>Reduce sodium to less than 2,300 mg per day</li>
                  <li>Aim for 30 minutes of moderate exercise most days</li>
                  <li>Monitor your blood pressure at home when possible</li>
                  <li>Take medications at the same time each day</li>
                  <li>Follow up promptly if symptoms worsen</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientSummaryPane;
