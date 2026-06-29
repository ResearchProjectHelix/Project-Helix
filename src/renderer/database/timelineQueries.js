import { supabase } from './supabaseClient.js';

export async function updateTimelineEvent(eventId, updates) {
  const payload = {};

  if ('status' in updates) {
    payload.status = updates.status;
    payload.done = updates.status === 'Completed';
  }
  if ('clinician' in updates) payload.clinician = updates.clinician;
  if ('notes' in updates) payload.notes = updates.notes;
  if ('documentId' in updates) payload.document_id = updates.documentId;

  const { error } = await supabase
    .from('timeline_events')
    .update(payload)
    .eq('id', eventId);

  if (error) throw error;
}