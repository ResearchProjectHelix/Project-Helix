import React from 'react';

export default function Dashboard({ patient }) {
  return (
    <div>
      <h1>Dashboard</h1>
      <section>
        <h2>{patient.name}</h2>
        <p>Age: {patient.age}</p>
        <p>Diagnosis: {patient.diagnosis}</p>
        <p>Stage: {patient.stage}</p>
      </section>
      <section>
        <h3>Alerts</h3>
        <ul>
          {patient.alerts.map((a) => (
            <li key={a.text}>⚠ {a.text}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}