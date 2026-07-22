import { useState, useCallback, useEffect } from "react";
import { updateTimelineEvent } from "../database/timelineQueries.js";
import { fetchDocumentsByPatient } from "../database/documentQueries.js";
import { useIsReadOnly } from "../hooks/useIsReadOnly.js";
import { useToast } from "../components/feedback/ToastContext.jsx";

function statusDotClass(status) {
  switch ((status || "").toLowerCase()) {
    case "completed":
      return "timeline-dot-completed";
    case "in progress":
      return "timeline-dot-progress";
    case "cancelled":
      return "timeline-dot-cancelled";
    default:
      return "timeline-dot-pending";
  }
}

function statusBadgeClass(status) {
  switch ((status || "").toLowerCase()) {
    case "completed":
      return "status-completed";
    case "in progress":
      return "status-in-progress";
    case "cancelled":
      return "status-cancelled";
    default:
      return "status-pending";
  }
}

function TimelineEventCard({ event, documents, onUpdated, readOnly }) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(event.status);
  const [clinician, setClinician] = useState(event.clinician);
  const [notes, setNotes] = useState(event.notes);
  const [documentId, setDocumentId] = useState(event.documentId || "");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  async function save() {
    setSaving(true);
    try {
      await updateTimelineEvent(event.id, {
        status,
        clinician,
        notes,
        documentId: documentId || null,
      });

      await onUpdated();
      setEditing(false);
      toast.success("Timeline event updated.");
    } catch (err) {
      console.error(err);
      toast.error("Unable to save timeline event.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="timeline-item">

      {/* LEFT SPINE */}
      <div className="timeline-spine">
        <div className={`timeline-dot ${statusDotClass(event.status)}`} />
        <div className="timeline-line" />
      </div>

      {/* CONTENT */}
      <div className="timeline-content">

        <div className="timeline-header">
          <div>
            <strong>{event.label}</strong>

            <div className={`status-badge ${statusBadgeClass(event.status)}`}>
              {event.status}
            </div>
          </div>

          <div className="timeline-meta">
            {event.date || "No date"}
          </div>
        </div>

        {!editing && (
          <div className="timeline-body">
            {event.clinician && (
              <p>
                <strong>Clinician:</strong> {event.clinician}
              </p>
            )}

            {event.notes && (
              <p>
                <strong>Notes:</strong> {event.notes}
              </p>
            )}

            {event.documentName && (
              <p>
                <strong>Linked Document:</strong> {event.documentName}
              </p>
            )}
          </div>
        )}

        {editing && !readOnly && (
          <div className="timeline-edit">

            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>

            <label>Clinician</label>
            <input
              value={clinician}
              onChange={(e) => setClinician(e.target.value)}
            />

            <label>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <label>Document</label>
            <select
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
            >
              <option value="">None</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <div className="modal-actions">
              <button className="primary" onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button className="secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {!editing && !readOnly && (
          <button
            className="secondary timeline-edit-btn"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}

export default function Timeline({ patient, refresh }) {
  const [documents, setDocuments] = useState([]);
  const readOnly = useIsReadOnly(patient);
  const toast = useToast();

  const loadDocs = useCallback(async () => {
    if (!patient) return;
    try {
      const docs = await fetchDocumentsByPatient(patient.id);
      setDocuments(docs);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load linked documents.");
    }
  }, [patient]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  return (
    <div className="timeline-page">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Clinical Timeline</h1>
          <p>Patient diagnostic and treatment progression</p>
        </div>
      </div>

      {readOnly && (
        <div
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "1.25rem",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            background: "rgba(74, 127, 214, 0.08)",
            color: "var(--text-secondary)",
            fontSize: "0.88rem",
          }}
        >
          Read-only — this patient's record is shared from another hospital. Timeline events cannot be edited here.
        </div>
      )}

      {/* TIMELINE */}
      <div className="timeline-container">
        {patient.timeline.map((event, idx) => (
          <TimelineEventCard
            key={event.id || idx}
            event={event}
            documents={documents}
            onUpdated={refresh}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}