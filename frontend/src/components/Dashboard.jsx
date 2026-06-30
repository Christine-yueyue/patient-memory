import { useMemo } from 'react';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function todayStr() {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

const Dashboard = ({ patients, onPatientSelect, onUploadEmr }) => {
  const stats = useMemo(() => {
    let overdue = 0;
    let pending = 0;
    const overItems = [];
    const pendItems = [];

    patients.forEach(p => {
      const gaps = p.careGaps || [];
      const pOver = gaps.filter(g => g.status === 'overdue');
      const pPen = gaps.filter(g => g.status === 'pending');
      overdue += pOver.length;
      pending += pPen.length;
      pOver.forEach(g => overItems.push({ patient: p, gap: g }));
      pPen.forEach(g => pendItems.push({ patient: p, gap: g }));
    });

    return { total: patients.length, overdue, pending, overItems, pendItems };
  }, [patients]);

  return (
    <div className="dashboard">
      <div className="dash-top">
        <span className="dash-date">{todayStr()}</span>
        <span className="dash-patients">{stats.total} patients</span>
      </div>

      <div className="dash-cards">
        <div className="dash-card dash-card-overdue">
          <div className="dash-card-header">
            <span className="dash-card-badge overdue">{stats.overdue}</span>
            <span className="dash-card-title">Overdue</span>
          </div>
          {stats.overItems.length === 0 ? (
            <div className="dash-card-empty">All caught up</div>
          ) : (
            <div className="dash-card-list">
              {stats.overItems.map((item, i) => (
                <div key={`ov-${i}`} className="dash-card-item" onClick={() => onPatientSelect(item.patient.id)}>
                  <span className="dash-item-pt">{item.patient.name}</span>
                  <span className="dash-item-text">{item.gap.gap}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dash-card dash-card-pending">
          <div className="dash-card-header">
            <span className="dash-card-badge pending">{stats.pending}</span>
            <span className="dash-card-title">Pending</span>
          </div>
          {stats.pendItems.length === 0 ? (
            <div className="dash-card-empty">Nothing pending</div>
          ) : (
            <div className="dash-card-list">
              {stats.pendItems.map((item, i) => (
                <div key={`pe-${i}`} className="dash-card-item" onClick={() => onPatientSelect(item.patient.id)}>
                  <span className="dash-item-pt">{item.patient.name}</span>
                  <span className="dash-item-text">{item.gap.gap}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dash-card dash-card-actions">
          <div className="dash-card-header">
            <span className="dash-card-title">Quick Actions</span>
          </div>
          <div className="dash-card-actions-list">
            <label className="dash-action-btn">
              <span className="dash-action-icon up">↑</span>
              <span className="dash-action-text">Upload EMR</span>
              <input type="file" accept=".json" onChange={onUploadEmr} hidden />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
