import React from 'react';

export default function Patient({ patient }) {
  return (
    <div>
      <h1>Patient Overview</h1>
      <section>
        <h2>{patient.name}</h2>
        <p>DOB: {patient.dob} (Age {patient.age})</p>
        <p>Sex: {patient.sex}</p>
        <p>MRN: {patient.mrn}</p>
        <p>GP: {patient.gp}</p>
        <p>Referral Date: {patient.referralDate}</p>
        <p>Working Diagnosis: {patient.diagnosis}</p>
        <p>Family History: {patient.familyHistory}</p>
      </section>
    </div>
  );
}