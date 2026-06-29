import { supabase } from './supabaseClient.js';
import { createPatient } from '../models/Patient.js';
import { evaluatePatientCompleteness } from '../models/completenessEngine.js';

function calculateAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

function formatDate(isoDate) {
  if (!isoDate) return null;
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

// Alerts and completeness are now computed by completenessEngine.js,
// run against the fully-assembled patient object further down.

export async function fetchAllPatients() {
  const { data: patientsData, error: patientsError } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: true });

  if (patientsError) throw patientsError;

  const patients = await Promise.all(
    patientsData.map((p) => fetchPatientById(p.id, p))
  );

  return patients;
}

export async function fetchPatientById(patientId, preloadedPatientRow = null) {
  let patientRow = preloadedPatientRow;

  if (!patientRow) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();
    if (error) throw error;
    patientRow = data;
  }

  const [bloodsRes, reportsRes, timelineRes, mdtRes] = await Promise.all([
    supabase.from('blood_tests').select('*').eq('patient_id', patientId),
    supabase.from('reports').select('*').eq('patient_id', patientId),
    supabase
      .from('timeline_events')
      .select('*, documents(id, name, file_path)')
      .eq('patient_id', patientId)
      .order('sort_order', { ascending: true }),
    supabase.from('mdt_notes').select('*').eq('patient_id', patientId),
  ]);

  if (bloodsRes.error) throw bloodsRes.error;
  if (reportsRes.error) throw reportsRes.error;
  if (timelineRes.error) throw timelineRes.error;
  if (mdtRes.error) throw mdtRes.error;

  const bloods = bloodsRes.data.map((b) => ({
    test: b.test,
    value: b.value,
    flag: b.flag,
  }));

  const reports = reportsRes.data.map((r) => ({
    type: r.type,
    date: formatDate(r.date),
    status: r.status,
  }));

  const timeline = timelineRes.data.map((t) => ({
    id: t.id,
    label: t.label,
    date: formatDate(t.event_date),
    done: t.done,
    status: t.status || (t.done ? 'Completed' : 'Pending'),
    clinician: t.clinician || '',
    notes: t.notes || '',
    documentId: t.document_id || null,
    documentName: t.documents ? t.documents.name : null,
    documentFilePath: t.documents ? t.documents.file_path : null,
  }));

  const mdtNotes = mdtRes.data.map((n) => ({
    date: formatDate(n.note_date) || 'Pending',
    summary: n.summary,
  }));

  const completeness = evaluatePatientCompleteness({
    bloods,
    reports,
    timeline,
    familyHistory: patientRow.family_history,
  });

  const alerts = completeness.missing;

  return createPatient({
    id: patientRow.id,
    name: patientRow.name,
    dob: formatDate(patientRow.dob),
    age: calculateAge(patientRow.dob),
    sex: patientRow.sex,
    mrn: patientRow.mrn,
    gp: patientRow.gp,
    referralDate: formatDate(patientRow.referral_date),
    diagnosis: patientRow.diagnosis,
    stage: patientRow.stage,
    familyHistory: patientRow.family_history,
    bloods,
    reports,
    timeline,
    mdtNotes,
    alerts,
    completeness,
  });
}