import { supabase } from './supabaseClient.js';

export async function createMDTNote(patientId) {
  const { data, error } = await supabase
    .from('mdt_notes')
    .insert([
      {
        patient_id: patientId,
        note_date: null,
        attendees: '',
        summary: '',
        decision: '',
        actions: '',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMDTNote(noteId, updates) {
  const { data, error } = await supabase
    .from('mdt_notes')
    .update(updates)
    .eq('id', noteId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMDTNote(noteId) {
  const { error } = await supabase
    .from('mdt_notes')
    .delete()
    .eq('id', noteId);

  if (error) throw error;
}