import { useState } from "react";
import { createMDTNote, updateMDTNote, deleteMDTNote } from "../database/mdtQueries.js";
import { useIsReadOnly } from "../hooks/useIsReadOnly.js";

function MDTNoteCard({ note, onSaved, onDeleted, readOnly }) {
  const isBlank = !note.attendees && !note.summary && !note.decision && !note.actions;
  const [editing, setEditing] = useState(isBlank && !readOnly);
  const [form, setForm] = useState({
    note_date: note.noteDateRaw || "",
    attendees: note.attendees || "",
    summary: note.summary || "",
    decision: note.decision || "",
    actions: note.actions || "",
  });
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateMDTNote(note.id, form);
      setEditing(false);
      await onSaved();
    } catch (err) {
      console.error(err);
      alert("Unable to save MDT note.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this MDT note? This cannot be undone.")) return;
    try {
      await deleteMDTNote(note.id);
      await onDeleted();
    } catch (err) {
      console.error(err);
      alert("Unable to delete MDT note.");
    }
  }

  if (editing) {
    return (
      <div className="timeline-card">
        <div className="timeline-event-edit">
          <label className="field-label">Meeting Date</label>
          <input
            type="date"
            value={form.note_date || ""}
            onChange={(e) => update("note_date", e.target.value)}
          />

          <label className="field-label">Attendees</label>
          <input
            value={form.attendees}
            onChange={(e) => update("attendees", e.target.value)}
            placeholder="e.g. Dr Keane, Dr Walsh, CNS Murphy"
          />

          <label className="field-label">Case Summary</label>
          <textarea
            rows={3}
            value={form.summary}
            onChange={(e) => update("summary", e.target.value)}
            placeholder="Summary of the case as presented"
          />

          <label className="field-label">Decision / Outcome</label>
          <textarea
            rows={2}
            value={form.decision}
            onChange={(e) => update("decision", e.target.value)}
            placeholder="MDT decision or recommended management"
          />

          <label className="field-label">Action Items</label>
          <textarea
            rows={2}
            value={form.actions}
            onChange={(e) => update("actions", e.target.value)}
            placeholder="Follow-up actions and who is responsible"
          />

          <div className="modal-actions">
            <button type="button" className="secondary" onClick={handleDelete}>
              Delete
            </button>
            <button type="button" className="primary" disabled={saving} onClick={handleSave}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-card">
      <div className="timeline-event-header">
        <strong>{note.date}</strong>
        {!readOnly && (
          <button type="button" className="timeline-edit-btn" onClick={() => setEditing(true)}>
            Edit
          </button>
        )}
      </div>

      <div className="timeline-event-details">
        {note.attendees && (
          <div>
            <strong>Attendees</strong>
            <p>{note.attendees}</p>
          </div>
        )}

        <div>
          <strong>Case Summary</strong>
          <p>{note.summary || "No summary recorded."}</p>
        </div>

        {note.decision && (
          <div>
            <strong>Decision / Outcome</strong>
            <p>{note.decision}</p>
          </div>
        )}

        {note.actions && (
          <div>
            <strong>Action Items</strong>
            <p>{note.actions}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MDTNotes({ patient, refresh }) {
  const [adding, setAdding] = useState(false);
  const readOnly = useIsReadOnly(patient);

  async function handleAddNote() {
    setAdding(true);
    try {
      await createMDTNote(patient.id);
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Unable to create MDT note.");
    } finally {
      setAdding(false);
    }
  }

  const notes = patient.mdtNotes || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>MDT Notes</h1>
          <p className="page-description">
            Record of multidisciplinary team discussions for this patient.
          </p>
        </div>

        {!readOnly && (
          <button type="button" className="primary" disabled={adding} onClick={handleAddNote}>
            {adding ? "Adding..." : "+ Add MDT Note"}
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
          Read-only — this patient's record is shared from another hospital. MDT notes cannot be added or edited here.
        </div>
      )}

      {notes.length === 0 ? (
        <div className="empty-state">
          No MDT discussions have been recorded for this patient yet.
        </div>
      ) : (
        <div className="timeline-container">
          {notes.map((note) => (
            <MDTNoteCard key={note.id} note={note} onSaved={refresh} onDeleted={refresh} readOnly={readOnly} />
          ))}
        </div>
      )}
    </div>
  );
}