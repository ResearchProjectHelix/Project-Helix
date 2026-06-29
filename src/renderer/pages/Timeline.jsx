import React from 'react';

export default function Timeline({ patient }) {
  return (
    <div>
      <h1>Diagnostic Timeline</h1>
      <ol>
        {patient.timeline.map((e) => (
          <li key={e.label}>
            {e.done ? '✅' : '⏳'} {e.label} {e.date ? `— ${e.date}` : '— pending'}
          </li>
        ))}
      </ol>
    </div>
  );
}