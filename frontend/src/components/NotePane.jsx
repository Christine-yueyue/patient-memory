import { useState } from 'react';

const SOAP_SECTIONS = ['SUBJECTIVE', 'OBJECTIVE', 'ASSESSMENT', 'PLAN'];

function extractSection(note, section) {
  const others = SOAP_SECTIONS.filter(s => s !== section).join('|');
  const regex = new RegExp(`${section}\\s*\\n([\\s\\S]*?)(?=(?:${others})|$)`, 'i');
  const match = note.match(regex);
  return match ? match[1].trim() : '';
}

const NotePane = ({ note }) => {
  const [status, setStatus] = useState('pending');
  const [copied, setCopied] = useState(false);

  if (!note) return null;

  const sections = SOAP_SECTIONS.map(s => ({ title: s, body: extractSection(note, s) }));

  function copyNote() {
    navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="pane note-pane">
      <div className="pane-heading review-header">
        <div>
          <p className="pane-kicker">ContinuCare Assistant</p>
          <h2>Clinical Note (SOAP)</h2>
        </div>
        <div className="header-actions">
          <span className={`status-pill ${status}`}>
            {status === 'pending' ? 'Needs review' : status === 'approved' ? 'Verified' : 'Declined'}
          </span>
          <button className="review-button muted" onClick={copyNote}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="review-actions">
        <button className="review-button" onClick={() => setStatus('approved')}>Verify note</button>
        <button className="review-button muted" onClick={() => setStatus('pending')}>Needs edits</button>
        <button className="review-button danger" onClick={() => setStatus('declined')}>Decline</button>
      </div>

      <div className="note-content">
        {sections.map(({ title, body }) => body ? (
          <div key={title} className="note-section">
            <h3 className="soap-header">{title}</h3>
            <div className="soap-body">
              {title === 'PLAN'
                ? body.split('\n').filter(Boolean).map((line, i) => (
                    <p key={i} className="plan-line">{line}</p>
                  ))
                : <p>{body}</p>
              }
            </div>
          </div>
        ) : null)}
      </div>
    </div>
  );
};

export default NotePane;
