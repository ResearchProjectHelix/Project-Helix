import React from "react";

function getRowClass(flag) {
  if (!flag) return "";
  return "blood-row-abnormal";
}

function getFlagLabel(flag) {
  if (!flag) return "";
  return "ABNORMAL";
}

export default function BloodResults({ patient }) {
  const bloods = patient.bloods || [];

  return (
    <div className="blood-results-page">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Blood Results</h1>
          <p>Laboratory results and abnormality screening</p>
        </div>
      </div>

      {/* TABLE CARD */}
      <section className="dashboard-card">

        {bloods.length === 0 ? (
          <p>No blood results available.</p>
        ) : (
          <table className="blood-table">
            <thead>
              <tr>
                <th>Test</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {bloods.map((b) => (
                <tr key={b.test} className={getRowClass(b.flag)}>
                  <td className="blood-test-name">{b.test}</td>

                  <td
                    className={`blood-value ${
                      b.flag ? "blood-value-abnormal" : ""
                    }`}
                  >
                    {b.value}
                  </td>

                  <td>
                    {b.flag ? (
                      <span className="blood-flag">
                        {getFlagLabel(b.flag)}
                      </span>
                    ) : (
                      <span className="blood-normal">NORMAL</span>
                    )}
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