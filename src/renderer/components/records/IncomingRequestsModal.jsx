import { useState, useEffect, useCallback } from "react";
import {
  fetchIncomingRequests,
  decideAccessRequest,
  fetchSharedAccessForPatient,
  revokeSharedAccess,
} from "../../database/accessRequestQueries.js";

export default function IncomingRequestsModal({ open, onClose }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decidingId, setDecidingId] = useState(null);
  const [sharedAccessMap, setSharedAccessMap] = useState({});
  const [revokingId, setRevokingId] = useState(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchIncomingRequests();
      setRequests(data);

      const approved = data.filter((r) => r.status === "approved");
      const accessEntries = await Promise.all(
        approved.map(async (r) => {
          const shared = await fetchSharedAccessForPatient(r.patientId);
          const match = shared.find((s) => s.organizationName === r.requestingOrgName);
          return [r.id, match?.id || null];
        })
      );
      setSharedAccessMap(Object.fromEntries(accessEntries));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadRequests();
  }, [open, loadRequests]);

  async function handleDecide(requestId, decision) {
    setDecidingId(requestId);
    try {
      await decideAccessRequest(requestId, decision);
      await loadRequests();
    } catch (err) {
      console.error(err);
      alert("Unable to update request.");
    } finally {
      setDecidingId(null);
    }
  }

  async function handleRevoke(requestId) {
    const sharedAccessId = sharedAccessMap[requestId];
    if (!sharedAccessId) return;
    if (!window.confirm("Revoke this hospital's access to this patient's record?")) return;

    setRevokingId(requestId);
    try {
      await revokeSharedAccess(sharedAccessId);
      await loadRequests();
    } catch (err) {
      console.error(err);
      alert("Unable to revoke access.");
    } finally {
      setRevokingId(null);
    }
  }

  if (!open) return null;

  const pending = requests.filter((r) => r.status === "pending");
  const decided = requests.filter((r) => r.status !== "pending");

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: "620px", maxWidth: "95vw" }}>

        <h2>Incoming Record Access Requests</h2>

        <p className="page-description">
          Requests from other hospitals to view patients in your organisation.
        </p>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {pending.length === 0 ? (
              <div className="empty-state">No pending requests.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
                {pending.map((r) => (
                  <div key={r.id} className="timeline-card">
                    <div style={{ fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                      <strong>{r.patientName}</strong> ({r.patientMrn})
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                      Requested by {r.requestingOrgName}
                    </div>
                    {r.reason && (
                      <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                        "{r.reason}"
                      </p>
                    )}
                    <div className="modal-actions">
                      <button
                        type="button"
                        className="secondary"
                        disabled={decidingId === r.id}
                        onClick={() => handleDecide(r.id, "denied")}
                      >
                        Deny
                      </button>
                      <button
                        type="button"
                        className="primary"
                        disabled={decidingId === r.id}
                        onClick={() => handleDecide(r.id, "approved")}
                      >
                        {decidingId === r.id ? "Saving..." : "Approve"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {decided.length > 0 && (
              <>
                <h3 style={{ marginTop: "1.5rem" }}>Previous Decisions</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {decided.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <span>
                        {r.patientName} — {r.requestingOrgName} —{" "}
                        <span style={{ color: r.status === "approved" ? "var(--success)" : "var(--critical)" }}>
                          {r.status}
                        </span>
                      </span>

                      {r.status === "approved" && sharedAccessMap[r.id] && (
                        <button
                          type="button"
                          className="secondary"
                          style={{ fontSize: "0.78rem", padding: "0.3rem 0.7rem" }}
                          disabled={revokingId === r.id}
                          onClick={() => handleRevoke(r.id)}
                        >
                          {revokingId === r.id ? "Revoking..." : "Revoke"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <div className="modal-actions">
          <button type="button" className="primary" onClick={onClose}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
}