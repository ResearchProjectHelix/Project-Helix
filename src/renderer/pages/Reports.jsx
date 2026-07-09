import { useState, useEffect, useCallback } from "react";
import { createReport, updateReport, deleteReport } from "../database/reportQueries.js";
import { fetchDocumentsByPatient } from "../database/documentQueries.js";
import { useIsReadOnly } from "../hooks/useIsReadOnly.js";

function statusClass(status) {
  switch ((status || "").toLowerCase()) {
    case "available":
      return "report-status-available";
    case "pending":
    case "processing":
      return "report-status-pending";
    case "not uploaded":
    case "missing":
      return "report-status-missing";
    default:
      return "report-status-unknown";
  }
}

function statusLabel(status) {
  if (!status) return "UNKNOWN";
  return status.toUpperCase();
}

function ReportRow({ report, documents, onSaved, onDeleted, readOnly }) {
  const isBlank = !report.type && !report.dateRaw;
  const [editing, setEditing] = useState(isBlank && !readOnly);
  const [form, setForm] = useState({
    type: report.type || "",
    date: report.dateRaw || "",
    status: report.status || "Pending",
    document_id: report.documentId || "",
  });
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateReport(report.id, {
        type: form.type,
        date: form.date || null,
        status: form.status,
        document_id: form.document_id || null,
      });
      setEditing(false);
      await onSaved();
    } catch (err) {
      console.error(err);
      alert("Unable to save report.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this report entry? This cannot be undone.")) return;
    try {
      await deleteReport(report.id);
      await onDeleted();
    } catch (err) {
      console.error(err);
      alert("Unable to delete report.");
    }
  }

  if (editing) {
    return (
      <tr>
        <td colSpan={4}>
          <div className="timeline-edit">
            <label>Type</label>
            <input
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              placeholder="e.g. CT Abdomen/Pelvis"
            />

            <label>Date</label>
            <input
              type="date"
              value={form.date || ""}
              onChange={(e) => update("date", e.target.value)}
            />

            <label>Status</label>
            <select value={form.status} onChange={(e) => update("status", e.target.value)}>
              <option>Pending</option>
              <option>Processing</option>
              <option>Available</option>
              <option>Not Uploaded</option>
            </select>

            <label>Linked Document</label>
            <select value={form.document_id} onChange={(e) => update("document_id", e.target.value)}>
              <option value="">None</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <div className="modal-actions">
              <button type="button" className="secondary" onClick={handleDelete}>
                Delete
              </button>
              <button type="button" className="primary" disabled={saving} onClick={handleSave}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="report-type">{report.type || "Untitled report"}</td>
      <td className="report-date">{report.date || "No date"}</td>
      <td>
        <span className={`report-status ${statusClass(report.status)}`}>
          {statusLabel(report.status)}
        </span>
        {report.documentName && (
          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Linked: {report.documentName}
          </div>
        )}
      </td>
      <td>
        {!readOnly && (
          <button type="button" className="timeline-edit-btn" onClick={() => setEditing(true)}>
            Edit
          </button>
        )}
      </td>
    </tr>
  );
}

export default function Reports({ patient, refresh }) {
  const [documents, setDocuments] = useState([]);
  const [adding, setAdding] = useState(false);
  const readOnly = useIsReadOnly(patient);

  const loadDocs = useCallback(async () => {
    if (!patient) return;
    const docs = await fetchDocumentsByPatient(patient.id);
    setDocuments(docs);
  }, [patient]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  async function handleAddReport() {
    setAdding(true);
    try {
      await createReport(patient.id);
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Unable to create report.");
    } finally {
      setAdding(false);
    }
  }

  const reports = patient.reports || [];

  return (
    <div className="reports-page">

      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p>Radiology, pathology, and clinical report status tracking</p>
        </div>

        {!readOnly && (
          <button type="button" className="primary" disabled={adding} onClick={handleAddReport}>
            {adding ? "Adding..." : "+ Add Report"}
          </button>
        )}
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
          Read-only — this patient's record is shared from another hospital. Reports cannot be added or edited here.
        </div>
      )}

      <section className="dashboard-card">
        {reports.length === 0 ? (
          <div className="empty-state">No reports available.</div>
        ) : (
          <table className="reports-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {reports.map((r) => (
                <ReportRow
                  key={r.id}
                  report={r}
                  documents={documents}
                  onSaved={refresh}
                  onDeleted={refresh}
                  readOnly={readOnly}
                />
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}