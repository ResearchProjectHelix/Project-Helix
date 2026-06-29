function completenessClass(pct) {
  if (pct >= 80) return 'status-completed';
  if (pct >= 50) return 'status-pending';
  return 'status-cancelled';
}

export default function Dashboard({ patient }) {
  const completeness = patient.completeness;

  return (
    <div>
      <h1>Dashboard</h1>
      <section>
        <h2>{patient.name}</h2>
        <p>Age: {patient.age}</p>
        <p>Diagnosis: {patient.diagnosis}</p>
        <p>Stage: {patient.stage}</p>
      </section>

      {completeness && (
        <section>
          <h3>Clinical Completeness</h3>
          <div className="completeness-row">
            <span className={`status-badge ${completenessClass(completeness.percentage)}`} style={{ fontSize: '1rem', padding: '0.4rem 0.8rem' }}>
              {completeness.percentage}%
            </span>
            <span className="timeline-date">
              {completeness.metChecks} of {completeness.totalChecks} checks complete
            </span>
          </div>
          {completeness.missing.length > 0 && (
            <>
              <p style={{ marginTop: '0.75rem' }}><strong>Missing:</strong></p>
              <ul>
                {completeness.missing.map((m) => (
                  <li key={m.key}>{m.text}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      <section>
        <h3>Alerts</h3>
        {patient.alerts.length === 0 ? (
          <p>No outstanding alerts.</p>
        ) : (
          <ul>
            {patient.alerts.map((a) => (
              <li key={a.key || a.text}>⚠ {a.text}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}