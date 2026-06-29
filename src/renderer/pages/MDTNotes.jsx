import React from 'react';

export default function MDTNotes({ patient }) {
  return (
    <div>
      <h1>MDT Notes</h1>
      {patient.mdtNotes.map((n) => (
        <div key={n.date}>
          <h3>{n.date}</h3>
          <p>{n.summary}</p>
        </div>
      ))}
    </div>
  );
}