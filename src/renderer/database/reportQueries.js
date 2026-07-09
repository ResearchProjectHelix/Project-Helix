import { supabase } from './supabaseClient.js';

export async function createReport(patientId) {
  const { data, error } = await supabase
    .from('reports')
    .insert([
      {
        patient_id: patientId,
        type: '',
        date: null,
        status: 'Pending',
        document_id: null,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReport(reportId, updates) {
  const { data, error } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteReport(reportId) {
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId);

  if (error) throw error;
}