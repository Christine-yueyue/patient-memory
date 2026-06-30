const CarePlanPane = ({ tasks }) => {
  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="section">
      <h2>Care Plan</h2>
      {tasks.map((t, i) => (
        <div key={i} className="careplan-task">
          <span className="careplan-task-text">{t.task}</span>
          <span className="careplan-task-due">{t.due}</span>
          <span className={`careplan-task-status ${t.status || 'pending'}`}>
            {t.status || 'pending'}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CarePlanPane;
