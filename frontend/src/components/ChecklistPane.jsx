import { useState } from 'react';

const ChecklistPane = ({ checklist, tasks }) => {
  const doctorTasks = (tasks || []).filter(t => t.assignee === 'doctor' || !t.assignee);
  const patientTasks = (tasks || []).filter(t => t.assignee === 'patient');

  const allItems = [
    ...doctorTasks.map(t => ({ text: t.task, due: t.due, type: 'doctor' })),
    ...patientTasks.map(t => ({ text: t.task, due: t.due, type: 'patient' })),
    ...(checklist || []).map(c => ({ text: c, type: 'closeout' })),
  ];

  const [checked, setChecked] = useState(() => new Array(allItems.length).fill(false));

  if (allItems.length === 0) return null;

  const toggle = (i) => setChecked(prev => prev.map((v, idx) => idx === i ? !v : v));
  const doneCount = checked.filter(Boolean).length;

  const typeLabel = { doctor: 'Clinician', patient: 'Patient', closeout: 'Close-out' };
  const typeClass = { doctor: 'tag-doctor', patient: 'tag-patient', closeout: 'tag-closeout' };

  return (
    <div className="pane checklist-pane">
      <div className="pane-heading review-header">
        <div>
          <h2>Visit Checklist</h2>
        </div>
        <span className="hint">{doneCount}/{allItems.length} complete</span>
      </div>
      <ul className="checklist">
        {allItems.map((item, i) => (
          <li
            key={i}
            className={`checklist-item ${checked[i] ? 'checklist-done' : ''}`}
            onClick={() => toggle(i)}
          >
            <span className={`checklist-box ${checked[i] ? 'checked' : ''}`}>
              {checked[i] ? '✓' : ''}
            </span>
            <div className="checklist-body">
              <span className="checklist-text">{item.text}</span>
              {item.due && <span className="checklist-due">Due: {item.due}</span>}
            </div>
            <span className={`checklist-tag ${typeClass[item.type]}`}>{typeLabel[item.type]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChecklistPane;
