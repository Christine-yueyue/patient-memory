const PatientMemoryPane = ({ wiki }) => {
  if (!wiki) return null;

  const formatList = (items) => {
    if (!items || items.length === 0) return 'None';
    return items.join(', ');
  };

  const formatPendingTasks = (pendingTasks) => {
    if (!pendingTasks || pendingTasks.length === 0) return 'None';
    return pendingTasks
      .map((task) => `${task.task} (due: ${task.due})`)
      .join(' | ');
  };

  // Merge narrative and history into one section
  const narrativeParts = [wiki.narrative, wiki.history].filter(Boolean);
  const combinedNarrative = narrativeParts.length > 0
    ? narrativeParts.join(' ')
    : 'No narrative available';

  const sections = [
    { title: 'CONDITIONS', body: formatList(wiki.conditions) },
    { title: 'MEDICATIONS', body: formatList(wiki.medications) },
    { title: 'PENDING TASKS', body: formatPendingTasks(wiki.pending_tasks) },
    { title: 'RESOLVED TASKS', body: formatList(wiki.resolved_tasks) },
    { title: 'NARRATIVE', body: combinedNarrative },
  ];

  return (
    <div className="pane memory-pane">
      <div className="pane-heading">
        <h2>Patient Summary</h2>
      </div>
      <div className="memory-content">
        {sections.map((section) => (
          <div key={section.title} className="memory-section">
            <h3>{section.title}</h3>
            <p>{section.body}</p>
          </div>
        ))}
      </div>
      <div className="memory-footer">
        <small>Stored in browser memory only — cleared on refresh.</small>
      </div>
    </div>
  );
};

export default PatientMemoryPane;
