import React from 'react';

export default function BloodResults({ patient }) {
  return (
    <div>
      <h1>Blood Results</h1>
      <table>
        <thead>
          <tr>
            <th>Test</th>
            <th>Value</th>
            <th>Flag</th>
          </tr>
        </thead>
        <tbody>
          {patient.bloods.map((b) => (
            <tr key={b.test}>
              <td>{b.test}</td>
              <td>{b.value}</td>
              <td>{b.flag ? '⚠' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}