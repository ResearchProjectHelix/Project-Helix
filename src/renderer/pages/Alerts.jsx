function priorityClass(severity) {
  if (severity === "high") return "status-cancelled";
  if (severity === "medium") return "status-pending";
  return "status-in-progress";
}

function priorityLabel(severity) {
  if (severity === "high") return "High Priority";
  if (severity === "medium") return "Medium Priority";
  return "Low Priority";
}

export default function Alerts({ patient }) {
  const alerts = patient.alerts || [];

  return (
    <div>
      <div className="page-header">
        <h1>Clinical Alerts</h1>
        <p className="page-subtitle">
          Decision support notifications highlighting incomplete investigations,
          missing clinical information and actions requiring review.
        </p>
      </div>

      {alerts.length === 0 && (
        <section className="alerts-empty">
          <h2>No Outstanding Clinical Alerts</h2>
          <p>
            All clinical completeness checks have been satisfied for this
            patient.
          </p>
        </section>
      )}

      <div className="alerts-list">
        {alerts.map((alert) => (
          <section
            key={alert.key || alert.text}
            className={`alert-card alert-${alert.severity}`}
          >
            <div className="alert-header">
              <span
                className={`status-badge ${priorityClass(alert.severity)}`}
              >
                {priorityLabel(alert.severity)}
              </span>

              <h2>{alert.text}</h2>
            </div>

            {alert.reason && (
              <div className="alert-section">
                <div className="alert-label">Reason</div>
                <p>{alert.reason}</p>
              </div>
            )}

            {alert.evidence && (
              <div className="alert-section">
                <div className="alert-label">Evidence</div>
                <p>{alert.evidence}</p>
              </div>
            )}

            {alert.suggestedAction && (
              <div className="alert-section">
                <div className="alert-label">Suggested Action</div>
                <p>{alert.suggestedAction}</p>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}