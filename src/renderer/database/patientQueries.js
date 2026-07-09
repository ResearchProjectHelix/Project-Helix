import { supabase } from './supabaseClient.js';
import { createPatient } from '../models/Patient.js';
import { evaluatePatientCompleteness } from '../models/completenessEngine.js';

/**
 * =========================
 * HELPERS
 * =========================
 */

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

/**
 * =========================
 * FETCH ALL PATIENTS
 * =========================
 */

export async function fetchAllPatients() {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .single();

  const myOrgId = profile?.organization_id;

  const { data: patientsData, error: patientsError } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: true });

  if (patientsError) throw patientsError;

  const patients = await Promise.all(
    patientsData.map((p) => fetchPatientById(p.id, p))
  );

  return patients.map((p, i) => ({
    ...p,
    isSharedIn: patientsData[i].hospital_id !== myOrgId,
  }));
}

/**
 * =========================
 * FETCH SINGLE PATIENT
 * =========================
 */

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

    supabase
      .from('reports')
      .select('*, documents(id, name)')
      .eq('patient_id', patientId),

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
    id: r.id,
    type: r.type,
    date: formatDate(r.date),
    dateRaw: r.date,
    status: r.status,
    documentId: r.document_id || null,
    documentName: r.documents ? r.documents.name : null,
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

  const mdtNotes = mdtRes.data
    .slice()
    .sort((a, b) => {
      if (!a.note_date) return 1;
      if (!b.note_date) return -1;
      return new Date(b.note_date) - new Date(a.note_date);
    })
    .map((n) => ({
      id: n.id,
      noteDateRaw: n.note_date,
      date: formatDate(n.note_date) || 'Date not recorded',
      attendees: n.attendees || '',
      summary: n.summary || '',
      decision: n.decision || '',
      actions: n.actions || '',
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
    patient_number: patientRow.patient_number,
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

/**
 * =========================
 * CREATE PATIENT
 * =========================
 */

function buildDefaultTimeline(patientId) {
  const events = [
    "GP Referral",
    "CT Scan",
    "MRI Scan",
    "Histopathology",
    "CA19-9",
    "MDT Review",
    "Family History Review",
  ];

  return events.map((label, index) => ({
    patient_id: patientId,
    label,
    event_date: null,
    done: false,
    status: "Pending",
    sort_order: index,
  }));
}

/**
 * MAIN CREATE PATIENT FUNCTION
 *
 * MRN is generated by the database (see trg_assign_mrn trigger) and
 * must never be supplied by the client. This guarantees uniqueness
 * under concurrent inserts, which client-side generation cannot.
 *
 * MDT notes are no longer auto-created here — clinicians add them
 * explicitly via the MDT Notes page as real discussions occur.
 */

export async function createPatientRecord(input) {
  try {
    /**
     * 1. Insert patient (MRN assigned automatically by DB trigger)
     */
    const { data: newPatient, error: insertError } = await supabase
      .from("patients")
      .insert([
        {
          name: input.name,
          dob: input.dob,
          sex: input.sex,
          gp: input.gp || "",
          referral_date: input.referralDate || null,
          diagnosis: input.diagnosis || "",
          stage: input.stage || "",
          family_history: input.familyHistory || "",
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    const patientId = newPatient.id;

    /**
     * 2. Create default timeline
     */
    const timeline = buildDefaultTimeline(patientId);

    const { error: timelineError } = await supabase
      .from("timeline_events")
      .insert(timeline);

    if (timelineError) throw timelineError;

    /**
     * 3. Create empty treatment plan
     */
    const { error: planError } = await supabase
      .from("treatment_plans")
      .insert([
        {
          patient_id: patientId,
          plan: "",
          start_date: null,
          status: "Pending",
        },
      ]);

    if (planError) throw planError;

    /**
     * 4. Return fully built patient
     */
    return await fetchPatientById(patientId);
  } catch (err) {
    console.error("Failed to create patient:", err);
    throw err;
  }
}