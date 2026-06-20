const PrescriptionsPane = ({ prescriptions }) => {
  if (!prescriptions || prescriptions.length === 0) return null;

  return (
    <div className="pane prescriptions-pane">
      <div className="pane-heading">
        <h2>Prescriptions</h2>
      </div>
      <p className="pane-note">Review before issuing. Clinician signature required.</p>
      <div className="rx-list">
        {prescriptions.map((rx, i) => (
          <div key={i} className="rx-card">
            <div className="rx-top">
              <span className="rx-icon">Rx</span>
              <span className="rx-name">{rx.medication}</span>
              <span className="rx-dose">{rx.dose}</span>
            </div>
            <div className="rx-details">
              <span className="rx-detail"><strong>Frequency:</strong> {rx.frequency}</span>
              <span className="rx-detail"><strong>Duration:</strong> {rx.duration}</span>
              {rx.instructions && (
                <span className="rx-detail"><strong>Instructions:</strong> {rx.instructions}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrescriptionsPane;
