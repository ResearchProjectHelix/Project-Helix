import React from "react";

function statusClass(status) {
  switch ((status || "").toLowerCase()) {
    case "available":
      return "report-status-available";
    case "pending":
    case "processing":
      return "report-status-pending";
    case "not uploaded":
    case "missing":
      return "report-status-missing";
    default:
      return "report-status-unknown";
  }
}

function statusLabel(status) {
  if (!status) return "UNKNOWN";
  return status.toUpperCase();
}

export default function Reports({ patient }) {
  const reports = patient.reports || [];

  return (
    <div className="reports-page">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p>Radiology, pathology, and clinical report status tracking</p>
        </div>
      </div>

      {/* CONTENT */}
      <section className="dashboard-card">

        {reports.length === 0 ? (
          <p>No reports available.</p>
        ) : (
          <table className="reports-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((r) => (
                <tr key={`${r.type}-${r.date}`}>

                  <td className="report-type">
                    {r.type}
                  </td>

                  <td className="report-date">
                    {r.date}
                  </td>

                  <td>
                    <span className={`report-status ${statusClass(r.status)}`}>
                      {statusLabel(r.status)}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}

      </section>
    </div>
  );
}