const RemindersPane = ({ patientReminders, doctorReminders }) => {
  const hasAny = (patientReminders?.length || 0) + (doctorReminders?.length || 0) > 0;
  if (!hasAny) return null;

  return (
    <div className="pane reminders-pane">
      <div className="pane-heading">
        <p className="pane-kicker">ContinuCare Assistant</p>
        <h2>Reminders</h2>
      </div>
      <div className="reminders-grid">
        {doctorReminders?.length > 0 && (
          <div className="reminder-col">
            <h3 className="reminder-col-title doctor-col">For the Clinician</h3>
            <ul className="reminder-list">
              {doctorReminders.map((r, i) => (
                <li key={i} className="reminder-item doctor-item">{r}</li>
              ))}
            </ul>
          </div>
        )}
        {patientReminders?.length > 0 && (
          <div className="reminder-col">
            <h3 className="reminder-col-title patient-col">For the Patient</h3>
            <ul className="reminder-list">
              {patientReminders.map((r, i) => (
                <li key={i} className="reminder-item patient-item">{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemindersPane;
