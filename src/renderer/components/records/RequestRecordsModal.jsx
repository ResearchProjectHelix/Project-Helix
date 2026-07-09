import { useState } from "react";
import { searchPatientsAtOtherHospitals, createAccessRequest } from "../../database/accessRequestQueries.js";
import { supabase } from "../../database/supabaseClient.js";

export default function RequestRecordsModal({ open, onClose, myOrganizationId }) {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    setSearching(true);
    setResults([]);
    setSelectedPatient(null);

    try {
      const data = await searchPatientsAtOtherHospitals(name.trim(), dob || null);
      setResults(data);
      if (data.length === 0) {
        setError("No matching patients found at other hospitals.");
      }
    } catch (err) {
      setError(err.message || "Search failed.");
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmitRequest() {
    setSubmitting(true);
    setError("");

    try {
      await createAccessRequest({
        patientId: selectedPatient.patient_id,
        organizationId: myOrganizationId,
        reason,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Unable to submit request.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setName("");
    setDob("");
    setResults([]);
    setSelectedPatient(null);
    setReason("");
    setError("");
    setSuccess(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: "560px", maxWidth: "95vw" }}>

        <h2>Request Patient Records</h2>

        <p className="page-description">
          Search for a patient at another hospital and request read access to their record.
        </p>

        {success ? (
          <>
            <div
              style={{
                padding: "0.75rem",
                marginBottom: "1rem",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "0.9rem",
              }}
            >
              Request submitted. The owning hospital's admin will need to approve it before you can view this record.
            </div>
            <div className="modal-actions">
              <button type="button" className="primary" onClick={handleClose}>
                Done
              </button>
            </div>
          </>
        ) : !selectedPatient ? (
          <>
            <form onSubmit={handleSearch}>
              <label className="field-label">Patient Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                style={{ width: "100%", marginBottom: "1rem", boxSizing: "border-box" }}
              />

              <label className="field-label">Date of Birth (optional, narrows results)</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                style={{ width: "100%", marginBottom: "1rem", boxSizing: "border-box" }}
              />

              <button type="submit" className="primary" disabled={searching} style={{ width: "100%" }}>
                {searching ? "Searching..." : "Search Other Hospitals"}
              </button>
            </form>

            {error && (
              <p style={{ color: "var(--critical)", fontSize: "0.85rem", marginTop: "1rem" }}>
                {error}
              </p>
            )}

            {results.length > 0 && (
              <div style={{ marginTop: "1rem", border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
                {results.map((r) => (
                  <div
                    key={r.patient_id}
                    onClick={() => setSelectedPatient(r)}
                    style={{
                      padding: "0.6rem 0.9rem",
                      cursor: "pointer",
                      borderBottom: "1px solid var(--border)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ fontSize: "0.95rem" }}>{r.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      DOB {r.dob} — {r.hospital_name}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="secondary" onClick={handleClose}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                padding: "0.75rem",
                marginBottom: "1rem",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                background: "var(--bg)",
              }}
            >
              <div style={{ fontSize: "0.95rem" }}>{selectedPatient.name}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                DOB {selectedPatient.dob} — {selectedPatient.hospital_name}
              </div>
            </div>

            <label className="field-label">Reason for request</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Patient now attending our MDT for shared oncology care"
              style={{ width: "100%", marginBottom: "1rem", boxSizing: "border-box" }}
            />

            {error && (
              <p style={{ color: "var(--critical)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {error}
              </p>
            )}

            <div className="modal-actions">
              <button type="button" className="secondary" onClick={() => setSelectedPatient(null)}>
                Back
              </button>
              <button type="button" className="primary" disabled={submitting} onClick={handleSubmitRequest}>
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}