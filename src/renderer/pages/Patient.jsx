import React from "react";

function InfoCard({ title, children }) {
  return (
    <section className="dashboard-card">
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  );
}

export default function Patient({ patient }) {
  return (
    <div className="patient-page">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Patient Overview</h1>
          <p>Structured clinical summary and background information</p>
        </div>
      </div>

      {/* TOP SUMMARY STRIP */}
      <div className="patient-header-card">
        <div>
          <h2>{patient.name}</h2>

          <div className="patient-summary">
            <span>Age {patient.age}</span>
            <span>•</span>
            <span>{patient.sex}</span>
            <span>•</span>
            <span>MRN {patient.mrn}</span>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div
        className="dashboard-grid"
        style={{
          gridTemplateColumns: "1fr 1fr",
          alignItems: "start",
        }}
      >

        {/* LEFT COLUMN */}
        <div>

          <InfoCard title="Demographics">
            <p><strong>DOB:</strong> {patient.dob}</p>
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Sex:</strong> {patient.sex}</p>
            <p><strong>MRN:</strong> {patient.mrn}</p>
          </InfoCard>

          <InfoCard title="Referral Information">
            <p><strong>GP:</strong> {patient.gp}</p>
            <p><strong>Referral Date:</strong> {patient.referralDate}</p>
          </InfoCard>

        </div>

        {/* RIGHT COLUMN */}
        <div>

          <InfoCard title="Clinical Overview">
            <p><strong>Diagnosis:</strong> {patient.diagnosis}</p>
            <p><strong>Stage:</strong> {patient.stage}</p>
          </InfoCard>

          <InfoCard title="Family History">
            <p>{patient.familyHistory || "No recorded family history"}</p>
          </InfoCard>

        </div>
      </div>
    </div>
  );
}