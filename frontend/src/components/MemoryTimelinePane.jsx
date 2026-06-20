const MemoryTimelinePane = ({ timeline }) => {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="pane timeline-pane">
      <div className="pane-heading">
        <p className="pane-kicker">Memory retention</p>
        <h2>Visit Timeline</h2>
      </div>
      <div className="timeline-list">
        {timeline.slice().reverse().map((visit) => (
          <div key={visit.id} className="timeline-item">
            <div className="timeline-header">
              <strong>{visit.label}</strong>
              <span>{visit.timestampLabel}</span>
            </div>
            <p className="timeline-summary">{visit.summary}</p>
            <div className="timeline-meta">
              <span>{visit.conditions.join(', ') || 'No conditions yet'}</span>
              <span>{visit.medications.join(', ') || 'No medications yet'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryTimelinePane;
