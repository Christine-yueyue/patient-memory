import { useState } from 'react';

const BillingPane = ({ billingItems }) => {
  const [billingState, setBillingState] = useState(() =>
    (billingItems || []).map((item) => ({
      ...item,
      review: item.approved ? 'approved' : 'pending',
    }))
  );

  const rows = (billingItems || []).map((item, index) => {
    const ui = billingState[index] || {};
    return {
      ...item,
      review: ui.review || (item.approved ? 'approved' : 'pending'),
    };
  });

  if (!billingItems || billingItems.length === 0) {
    return (
      <div className="pane billing-pane">
        <div className="pane-heading">
          <h2>Suggested Billing Codes</h2>
        </div>
        <p className="empty-state">No billing codes suggested.</p>
        <p className="hint">Clinician approval required before billing.</p>
      </div>
    );
  }

  const setReview = (index, review) => {
    setBillingState((prev) => {
      const next = [...prev];
      next[index] = {
        ...(next[index] || {}),
        review,
      };
      return next;
    });
  };

  return (
    <div className="pane billing-pane">
      <div className="pane-heading review-header">
        <div>
          <h2>Suggested Billing Codes</h2>
        </div>
        <div className="status-pill pending">Doctor review</div>
      </div>
      <div className="billing-warning">
        AI suggestions only. The doctor should verify or decline each code.
      </div>
      <div className="billing-list">
        {rows.map((item, index) => (
          <div key={index} className={`billing-item ${item.review}`}>
            <div className="billing-header">
              <span className="billing-code">{item.code}</span>
              <span className="billing-label">{item.label}</span>
            </div>
            <div className="item-review-meta">
              <span className={`status-pill ${item.review}`}>{item.review}</span>
            </div>
            <div className="billing-details">
              <div className="billing-rationale">
                <strong>Rationale:</strong> {item.rationale}
              </div>
              <div className="billing-source">
                <strong>Source:</strong> "{item.source}"
              </div>
            </div>
            <div className="billing-actions">
              <button
                onClick={() => setReview(index, 'approved')}
                className="review-button"
              >
                Approve
              </button>
              <button
                onClick={() => setReview(index, 'declined')}
                className="review-button danger"
              >
                Decline
              </button>
              <button
                onClick={() => setReview(index, 'pending')}
                className="review-button muted"
              >
                Reset
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BillingPane;
