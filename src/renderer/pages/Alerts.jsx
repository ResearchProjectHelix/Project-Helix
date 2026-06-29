import React from 'react';

export default function Alerts({ patient }) {
  return (
    <div>
      <h1>Alerts</h1>
      <ul>
        {patient.alerts.map((a) => (
          <li key={a.text}>
            ⚠ {a.text} <em>({a.severity})</em>
          </li>
        ))}
      </ul>
    </div>
  );
}