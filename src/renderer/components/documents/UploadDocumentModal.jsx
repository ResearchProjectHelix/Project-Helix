import { useState } from 'react';
import { DocumentCategory, DocumentType } from '../../models/document.js';

export default function UploadDocumentModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    name: '',
    category: DocumentCategory.IMAGING,
    type: DocumentType.CT,
    bodyPart: '',
    clinician: '',
    hospital: '',
    date: '',
    notes: '',
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      await onSave({ formData: form, file });
      onClose();
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Upload Clinical Document</h2>

        <label className="field-label">Document Name</label>
        <input name="name" placeholder="e.g. CT Abdomen 17/06/2026" value={form.name} onChange={handleChange} />

        <label className="field-label">Category</label>
        <select name="category" value={form.category} onChange={handleChange}>
          {Object.values(DocumentCategory).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label className="field-label">Type</label>
        <select name="type" value={form.type} onChange={handleChange}>
          {Object.values(DocumentType).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <label className="field-label">Body Part</label>
        <input name="bodyPart" placeholder="e.g. Abdomen" value={form.bodyPart} onChange={handleChange} />

        <label className="field-label">Clinician</label>
        <input name="clinician" placeholder="e.g. Dr. Sean Brennan" value={form.clinician} onChange={handleChange} />

        <label className="field-label">Hospital</label>
        <input name="hospital" placeholder="e.g. Letterkenny University Hospital" value={form.hospital} onChange={handleChange} />

        <label className="field-label">Date</label>
        <input type="date" name="date" value={form.date} onChange={handleChange} />

        <label className="field-label">Notes</label>
        <textarea name="notes" placeholder="Optional notes" value={form.notes} onChange={handleChange} />

        <label className="field-label">File (PDF or image)</label>
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files[0] || null)}
        />

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button onClick={submit} disabled={saving} className="primary">
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={onClose} disabled={saving} className="secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}