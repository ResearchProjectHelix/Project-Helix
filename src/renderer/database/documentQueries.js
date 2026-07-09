import { supabase } from './supabaseClient.js';

const BUCKET = 'clinical-documents';
const SIGNED_URL_EXPIRY_SECONDS = 60 * 10; // 10 minutes

function formatDate(isoDate) {
  if (!isoDate) return null;
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export async function fetchDocumentsByPatient(patientId) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('patient_id', patientId)
    .order('uploaded_at', { ascending: false });

  if (error) throw error;

  const documents = await Promise.all(
    data.map(async (d) => {
      let fileUrl = null;

      if (d.file_path) {
        const { data: signedData, error: signedError } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(d.file_path, SIGNED_URL_EXPIRY_SECONDS);

        if (!signedError) {
          fileUrl = signedData.signedUrl;
        }
      }

      return {
        id: d.id,
        name: d.name,
        category: d.category,
        type: d.type,
        bodyPart: d.body_part || '',
        clinician: d.clinician || '',
        hospital: d.hospital || '',
        date: formatDate(d.doc_date),
        notes: d.notes || '',
        fileName: d.file_name || '',
        filePath: d.file_path || '',
        fileUrl,
        uploadedAt: d.uploaded_at,
      };
    })
  );

  return documents;
}

export async function uploadDocument({ patientId, file, formData }) {
  let filePath = null;
  let fileName = null;

  if (file) {
    fileName = file.name;
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    filePath = `${patientId}/${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, { upsert: false });

    if (uploadError) throw uploadError;
  }

  const { data, error } = await supabase
    .from('documents')
    .insert({
      patient_id: patientId,
      name: formData.name || fileName || 'Untitled document',
      category: formData.category,
      type: formData.type,
      body_part: formData.bodyPart || null,
      clinician: formData.clinician || null,
      hospital: formData.hospital || null,
      doc_date: formData.date || null,
      notes: formData.notes || null,
      file_path: filePath,
      file_name: fileName,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteDocument(documentId, filePath) {
  if (filePath) {
    await supabase.storage.from(BUCKET).remove([filePath]);
  }

  const { error } = await supabase.from('documents').delete().eq('id', documentId);
  if (error) throw error;
}