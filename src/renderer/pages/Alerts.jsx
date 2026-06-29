function priorityClass(severity) {
  if (severity === 'high') return 'status-cancelled';
  if (severity === 'medium') return 'status-pending';
  return 'status-in-progress';
}

export default function Alerts({ patient }) {
  const alerts = patient.alerts || [];

  return (
    <div>
      <h1>Alerts</h1>

      {alerts.length === 0 && <p>No outstanding alerts — all checks passed.</p>}

      <div className="alerts-list">
        {alerts.map((a) => (
          <section key={a.key || a.text} className="alert-card">
            <div className="alert-header">
              <span className={`status-badge ${priorityClass(a.severity)}`}>
                {a.severity === 'high' ? 'High Priority' : a.severity === 'medium' ? 'Medium Priority' : 'Low Priority'}
              </span>
              <strong>{a.text}</strong>
            </div>
            {a.reason && <p><strong>Reason:</strong> {a.reason}</p>}
            {a.evidence && <p><strong>Evidence:</strong> {a.evidence}</p>}
            {a.suggestedAction && <p><strong>Suggested Action:</strong> {a.suggestedAction}</p>}
          </section>
        ))}
      </div>
    </div>
  );
}