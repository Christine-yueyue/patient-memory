const PatientSummaryPane = ({ patientSummary, tasks, insights, onCopy }) => {
  if (!patientSummary && (!tasks || tasks.length === 0)) return null;

  const handleCopy = async () => {
    if (onCopy) {
      await onCopy();
    }
  };

  return (
    <div className="pane summary-pane">
      <div className="pane-heading review-header">
        <div>
          <p className="pane-kicker">Patient handoff</p>
          <h2>Plain-language summary</h2>
        </div>
        <button className="review-button" onClick={handleCopy}>
          Copy summary
        </button>
      </div>

      <p className="summary-copy">
        {patientSummary || 'A patient-friendly summary will appear here after the visit is processed.'}
      </p>

      <div className="summary-block">
        <h3>Next steps</h3>
        <ul className="summary-list">
          {(tasks || []).slice(0, 4).map((task, index) => (
            <li key={`${task.task}-${index}`}>{task.task} ({task.due})</li>
          ))}
          {(!tasks || tasks.length === 0) && (
            <li>No follow-up items were suggested.</li>
          )}
        </ul>
      </div>

      {insights && insights.length > 0 && (
        <div className="summary-block">
          <h3>AI insights</h3>
          <ul className="summary-list">
            {insights.map((insight, index) => (
              <li key={`${insight}-${index}`}>{insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PatientSummaryPane;
