import React from "react";

function groupByTest(bloods) {
  const groups = new Map();

  for (const b of bloods) {
    if (!groups.has(b.test)) {
      groups.set(b.test, []);
    }
    groups.get(b.test).push(b);
  }

  // Most recent result first within each test's history
  for (const results of groups.values()) {
    results.sort((a, b) => new Date(b.recordedAtRaw) - new Date(a.recordedAtRaw));
  }

  return groups;
}

export default function BloodResults({ patient }) {
  const bloods = patient.bloods || [];
  const grouped = groupByTest(bloods);

  return (
    <div className="blood-results-page">
      <div className="page-header">
        <div>
          <h1>Blood Results</h1>
          <p>Laboratory results and abnormality screening</p>
        </div>
      </div>

      {grouped.size === 0 ? (
        <section className="dashboard-card">
          <p>No blood results available.</p>
        </section>
      ) : (
        Array.from(grouped.entries()).map(([testName, results]) => (
          <section className="dashboard-card" key={testName}>
            <h3>{testName}</h3>

            <table className="blood-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Value</th>
                  <th>Reference Range</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {results.map((b) => (
                  <tr
                    key={b.id}
                    className={b.flag ? "blood-row-flagged" : ""}
                  >
                    <td>{b.recordedAt || "—"}</td>

                    <td
                      className={`blood-value ${
                        b.flag ? "blood-value-flagged" : "blood-value-normal"
                      }`}
                    >
                      {b.value}
                      {b.unit ? ` ${b.unit}` : ""}
                    </td>

                    <td>{b.referenceRange || "—"}</td>

                    <td>
                      {b.flag ? (
                        <span className="blood-flag">ABNORMAL</span>
                      ) : (
                        <span className="blood-normal">NORMAL</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))
      )}
    </div>
  );
}