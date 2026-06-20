import { useState } from 'react';

const NotePane = ({ note }) => {
  const [reviewStatus, setReviewStatus] = useState('pending');

  if (!note) return null;

  const extractSection = (source, sectionName) => {
    const sections = ['CHIEF COMPLAINT', 'HISTORY OF PRESENT ILLNESS', 'ASSESSMENT', 'PLAN'];
    const nextSections = sections.filter((section) => section !== sectionName).join('|');
    const regex = new RegExp(
      `${sectionName}:?\\s*([\\s\\S]*?)(?=${nextSections}|$)`,
      'i'
    );
    const match = source.match(regex);
    return match ? match[1].trim() : source.trim();
  };

  const sections = [
    { title: 'CHIEF COMPLAINT', body: extractSection(note, 'CHIEF COMPLAINT') },
    { title: 'HISTORY OF PRESENT ILLNESS', body: extractSection(note, 'HISTORY OF PRESENT ILLNESS') },
    { title: 'ASSESSMENT', body: extractSection(note, 'ASSESSMENT') },
    { title: 'PLAN', body: extractSection(note, 'PLAN') },
  ];

  return (
    <div className="pane note-pane">
      <div className="pane-heading review-header">
        <div>
          <p className="pane-kicker">Generated output</p>
          <h2>Clinical Note</h2>
        </div>
        <div className={`status-pill ${reviewStatus}`}>
          {reviewStatus === 'pending' && 'Needs review'}
          {reviewStatus === 'approved' && 'Verified'}
          {reviewStatus === 'declined' && 'Declined'}
        </div>
      </div>

      <div className="review-actions">
        <button className="review-button" onClick={() => setReviewStatus('approved')}>
          Verify note
        </button>
        <button className="review-button muted" onClick={() => setReviewStatus('pending')}>
          Needs edits
        </button>
        <button className="review-button danger" onClick={() => setReviewStatus('declined')}>
          Decline
        </button>
      </div>

      <div className="note-content">
        {sections.map((section) => (
          <div key={section.title} className="note-section">
            <h3>{section.title}</h3>
            <p>{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotePane;
