import { useState, useEffect, useCallback, useMemo } from 'react';
import DocumentList from '../components/documents/DocumentList.jsx';
import UploadDocumentModal from '../components/documents/UploadDocumentModal.jsx';
import DocumentPreview from '../components/documents/DocumentPreview.jsx';
import { fetchDocumentsByPatient, uploadDocument, deleteDocument } from '../database/documentQueries.js';
import { useIsReadOnly } from '../hooks/useIsReadOnly.js';
import { useConfirm } from '../components/feedback/ConfirmContext.jsx';
import { useToast } from '../components/feedback/ToastContext.jsx';

export default function ClinicalDocuments({ patient }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const readOnly = useIsReadOnly(patient);
  const confirm = useConfirm();
  const toast = useToast();

  const loadDocuments = useCallback(async () => {
    if (!patient) return;
    setLoading(true);
    try {
      const docs = await fetchDocumentsByPatient(patient.id);
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents:', err);
      toast.error('Unable to load documents.');
    } finally {
      setLoading(false);
    }
  }, [patient]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function handleSave({ formData, file }) {
    try {
      await uploadDocument({ patientId: patient.id, file, formData });
      await loadDocuments();
      toast.success('Document uploaded.');
    } catch (err) {
      console.error('Failed to upload document:', err);
      toast.error('Unable to upload document.');
      throw err;
    }
  }

  async function handleDelete(document) {
    const ok = await confirm({
      title: 'Delete document?',
      message: `Delete "${document.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;

    try {
      await deleteDocument(document.id, document.filePath);
      await loadDocuments();
      toast.success('Document deleted.');
    } catch (err) {
      console.error('Failed to delete document:', err);
      toast.error('Unable to delete document.');
    }
  }

  const categories = useMemo(() => {
    const unique = new Set(documents.map((d) => d.category).filter(Boolean));
    return ['All', ...Array.from(unique)];
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    if (categoryFilter === 'All') return documents;
    return documents.filter((d) => d.category === categoryFilter);
  }, [documents, categoryFilter]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Clinical Documents</h1>
          <p className="page-description">
            Uploaded reports, imaging, and correspondence for this patient.
          </p>
        </div>

        {!readOnly && (
          <button onClick={() => setShowUpload(true)} className="primary">
            + Upload Document
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
          Read-only — this patient's record is shared from another hospital. Documents cannot be uploaded or deleted here.
        </div>
      )}

      {documents.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={categoryFilter === cat ? 'primary' : 'secondary'}
              onClick={() => setCategoryFilter(cat)}
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p>Loading documents…</p>
      ) : (
        <DocumentList
          documents={filteredDocuments}
          onPreview={setPreview}
          onDelete={readOnly ? null : handleDelete}
        />
      )}

      {showUpload && (
        <UploadDocumentModal onSave={handleSave} onClose={() => setShowUpload(false)} />
      )}

      <DocumentPreview document={preview} onClose={() => setPreview(null)} />
    </div>
  );
}