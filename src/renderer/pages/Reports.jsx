import React from 'react';

export default function Reports({ patient }) {
  return (
    <div>
      <h1>Reports</h1>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {patient.reports.map((r) => (
            <tr key={r.type}>
              <td>{r.type}</td>
              <td>{r.date}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}