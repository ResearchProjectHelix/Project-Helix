import { useState, useEffect, useCallback } from 'react';
import { updateTimelineEvent } from '../database/timelineQueries.js';
import { fetchDocumentsByPatient } from '../database/documentQueries.js';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

function statusClass(status) {
  if (status === 'Completed') return 'status-completed';
  if (status === 'In Progress') return 'status-in-progress';
  if (status === 'Cancelled') return 'status-cancelled';
  return 'status-pending';
}

function TimelineEventCard({ event, documents, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(event.status);
  const [clinician, setClinician] = useState(event.clinician);
  const [notes, setNotes] = useState(event.notes);
  const [documentId, setDocumentId] = useState(event.documentId || '');
  const [saving, setSaving] = useState(false);

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
    } catch (err) {
      console.error('Failed to update timeline event:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="timeline-event">
      <div className="timeline-event-header">
        <span className={`status-badge ${statusClass(event.status)}`}>{event.status}</span>
        <strong>{event.label}</strong>
        <span className="timeline-date">{event.date || 'No date set'}</span>
        <button onClick={() => setEditing((e) => !e)} className="secondary timeline-edit-btn">
          {editing ? 'Close' : 'Edit'}
        </button>
      </div>

      {!editing && (
        <div className="timeline-event-details">
          {event.clinician && <p><strong>Clinician:</strong> {event.clinician}</p>}
          {event.notes && <p><strong>Notes:</strong> {event.notes}</p>}
          {event.documentName && <p><strong>Linked document:</strong> {event.documentName}</p>}
        </div>
      )}

      {editing && (
        <div className="timeline-event-edit">
          <label className="field-label">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <label className="field-label">Clinician</label>
          <input value={clinician} onChange={(e) => setClinician(e.target.value)} placeholder="e.g. Dr. Sean Brennan" />

          <label className="field-label">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />

          <label className="field-label">Linked Document</label>
          <select value={documentId} onChange={(e) => setDocumentId(e.target.value)}>
            <option value="">None</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <div className="modal-actions">
            <button onClick={save} disabled={saving} className="primary">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export default function Timeline({ patient, refresh }) {
  const [documents, setDocuments] = useState([]);

  const loadDocuments = useCallback(async () => {
    if (!patient) return;
    try {
      const docs = await fetchDocumentsByPatient(patient.id);
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents for timeline linking:', err);
    }
  }, [patient]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <div>
      <h1>Diagnostic Timeline</h1>
      <ol className="timeline-list">
        {patient.timeline.map((event) => (
          <TimelineEventCard
            key={event.id || event.label}
            event={event}
            documents={documents}
            onUpdated={refresh}
          />
        ))}
      </ol>
    </div>
  );
}