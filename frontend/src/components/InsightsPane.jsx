const InsightsPane = ({ insights }) => {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="pane insights-pane">
      <div className="pane-heading">
        <p className="pane-kicker">ContinuCare Assistant</p>
        <h2>Clinical Insights</h2>
      </div>
      <div className="insights-list">
        {insights.map((insight, index) => (
          <div key={`${insight}-${index}`} className="insight-item">
            {insight}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsPane;
