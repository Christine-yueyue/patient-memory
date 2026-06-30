const PatientStoryPane = ({ patientStory, loading }) => {
  if (loading) return <div className="loading">Loading patient story...</div>;
  if (!patientStory) return null;

  return (
    <div className="section">
      <h2>Patient Story</h2>
      <p>{patientStory}</p>
    </div>
  );
};

export default PatientStoryPane;
