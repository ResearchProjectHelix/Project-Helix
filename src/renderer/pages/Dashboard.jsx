function completenessClass(pct) {
  if (pct >= 80) return "status-completed";
  if (pct >= 50) return "status-pending";
  return "status-cancelled";
}

function CompletenessRing({ percentage }) {
  const radius = 72;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  let colour = "#22c55e";
  if (percentage < 80) colour = "#f59e0b";
  if (percentage < 50) colour = "#ef4444";

  return (
    <div className="completeness-ring">
      <svg width="180" height="180" viewBox="0 0 180 180">
        {/* background ring */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          strokeWidth={stroke}
          fill="none"
          stroke="var(--border)"
        />

        {/* progress ring */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke={colour}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 90 90)"
          style={{
            transition: "stroke-dashoffset 0.6s ease",
          }}
        />

        {/* percentage */}
        <text
          x="90"
          y="88"
          textAnchor="middle"
          style={{
            fill: "var(--text-primary)",
            fontSize: "1.8rem",
            fontWeight: "700",
          }}
        >
          {percentage}%
        </text>

        {/* label */}
        <text
          x="90"
          y="110"
          textAnchor="middle"
          style={{
            fill: "var(--text-secondary)",
            fontSize: "0.75rem",
            letterSpacing: "0.05em",
          }}
        >
          COMPLETENESS
        </text>
      </svg>
    </div>
  );
}

export default function Dashboard({ patient }) {
  const completeness = patient.completeness;

  return (
    <div className="dashboard-page">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Clinical overview and completeness assessment for the active patient.
          </p>
        </div>
      </div>

      {/* PATIENT HEADER */}
      <div className="patient-header-card">
        <div>
          <h2>{patient.name}</h2>

          <div className="patient-summary">
            <span>Age {patient.age}</span>
            <span>•</span>
            <span>{patient.diagnosis}</span>
            <span>•</span>
            <span>Stage {patient.stage}</span>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      {completeness && (
        <div
          className="dashboard-grid"
          style={{
            gridTemplateColumns: "1.1fr 0.9fr",
            alignItems: "start",
          }}
        >
          {/* LEFT: COMPLETENESS */}
          <section className="dashboard-card">
            <h3>Clinical Completeness</h3>

            <div className="completeness-layout">
              <CompletenessRing percentage={completeness.percentage} />

              <div className="completeness-info">
                <div
                  className={`status-badge ${completenessClass(
                    completeness.percentage
                  )}`}
                >
                  {completeness.metChecks} of {completeness.totalChecks} checks complete
                </div>

                <h4 style={{ marginTop: "1rem" }}>Outstanding Items</h4>

                {completeness.missing.length === 0 ? (
                  <p>All required clinical information is present.</p>
                ) : (
                  <ul className="missing-list">
                    {completeness.missing.map((item) => (
                      <li key={item.key}>{item.text}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          {/* RIGHT: ALERTS */}
          <section className="dashboard-card">
            <h3>Active Alerts</h3>

            {patient.alerts.length === 0 ? (
              <div className="empty-state">
                No outstanding clinical alerts.
              </div>
            ) : (
              <div className="alert-list">
                {patient.alerts.map((alert) => (
                  <div
                    className="alert-card"
                    key={alert.key || alert.text}
                  >
                    <div className="alert-icon">⚠</div>

                    <div style={{ flex: 1 }}>
                      <strong style={{ display: "block", marginBottom: "0.25rem" }}>
                        Clinical Alert
                      </strong>

                      <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                        {alert.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}