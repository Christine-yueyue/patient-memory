import { useState, useMemo } from 'react';

const PatientSelector = ({ patients, selectedPatientId, onPatientSelect, loading }) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.conditions.some(c => c.name.toLowerCase().includes(q))
    );
  }, [search]);

  const calcAge = (dob) => {
    if (!dob) return '';
    return new Date().getFullYear() - new Date(dob).getFullYear();
  };

  const overdueCount = (p) => p.careGaps?.filter(g => g.status === 'overdue').length || 0;

  return (
    <>
      <div className="patient-search">
        <input
          type="text"
          placeholder="Search patients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="patient-list-items">
        {filtered.map(p => {
          const overdue = overdueCount(p);
          return (
            <div
              key={p.id}
              className={`patient-row ${selectedPatientId === p.id ? 'active' : ''}`}
              onClick={() => !loading && onPatientSelect(p.id)}
            >
              <span className="patient-row-name">{p.name}</span>
              <span className="patient-row-right">
                <span className="patient-row-age">{calcAge(p.dob)}</span>
                {overdue > 0 && <span className="overdue-count">{overdue}</span>}
              </span>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="patient-list-empty">No patients matching "{search}"</div>
        )}
      </div>
    </>
  );
};

export default PatientSelector;
