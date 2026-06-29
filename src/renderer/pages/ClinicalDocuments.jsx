import { useState, useEffect, useCallback } from 'react';
import DocumentList from '../components/documents/DocumentList.jsx';
import UploadDocumentModal from '../components/documents/UploadDocumentModal.jsx';
import DocumentPreview from '../components/documents/DocumentPreview.jsx';
import { fetchDocumentsByPatient, uploadDocument } from '../database/documentQueries.js';

export default function ClinicalDocuments({ patient }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const loadDocuments = useCallback(async () => {
    if (!patient) return;
    setLoading(true);
    try {
      const docs = await fetchDocumentsByPatient(patient.id);
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  }, [patient]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function handleSave({ formData, file }) {
    await uploadDocument({ patientId: patient.id, file, formData });
    await loadDocuments();
  }

  return (
    <div>
      <h1>Clinical Documents</h1>

      <button onClick={() => setShowUpload(true)} className="primary">Upload Document</button>

      {loading ? (
        <p>Loading documents…</p>
      ) : (
        <DocumentList documents={documents} onPreview={setPreview} />
      )}

      {showUpload && (
        <UploadDocumentModal onSave={handleSave} onClose={() => setShowUpload(false)} />
      )}

      <DocumentPreview document={preview} onClose={() => setPreview(null)} />
    </div>
  );
}