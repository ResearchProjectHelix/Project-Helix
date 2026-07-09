import { supabase } from './supabaseClient.js';

export async function searchPatientsAtOtherHospitals(name, dob = null) {
  const { data, error } = await supabase.rpc('search_patients_for_access_request', {
    search_name: name,
    search_dob: dob || null,
  });

  if (error) throw error;
  return data;
}

export async function createAccessRequest({ patientId, organizationId, reason }) {
  const { data, error } = await supabase
    .from('record_access_requests')
    .insert([
      {
        patient_id: patientId,
        requesting_org_id: organizationId,
        reason: reason || null,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchIncomingRequests() {
  const { data, error } = await supabase
    .from('record_access_requests')
    .select('*, patients(name, mrn), organizations:requesting_org_id(name)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((r) => ({
    id: r.id,
    patientId: r.patient_id,
    patientName: r.patients?.name,
    patientMrn: r.patients?.mrn,
    requestingOrgName: r.organizations?.name,
    reason: r.reason,
    status: r.status,
    createdAt: r.created_at,
  }));
}

export async function decideAccessRequest(requestId, decision) {
  const { data: userData } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('record_access_requests')
    .update({
      status: decision,
      decided_by: userData.user.id,
      decided_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (error) throw error;
}

export async function fetchSharedAccessForPatient(patientId) {
  const { data, error } = await supabase
    .from('patient_shared_access')
    .select('*, organizations:granted_to_org_id(name)')
    .eq('patient_id', patientId);

  if (error) throw error;

  return data.map((s) => ({
    id: s.id,
    organizationName: s.organizations?.name,
    grantedAt: s.granted_at,
  }));
}

export async function revokeSharedAccess(sharedAccessId) {
  const { error } = await supabase
    .from('patient_shared_access')
    .delete()
    .eq('id', sharedAccessId);

  if (error) throw error;
}