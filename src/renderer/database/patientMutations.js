import { supabase } from "./supabaseClient.js";

export async function updatePatient(patientId, updates) {
  const { data, error } = await supabase
    .from("patients")
    .update(updates)
    .eq("id", patientId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deletePatient(patientId) {
  const { error } = await supabase
    .from("patients")
    .delete()
    .eq("id", patientId);

  if (error) {
    throw error;
  }
}

export async function archivePatient() {
  throw new Error("Not implemented yet");
}