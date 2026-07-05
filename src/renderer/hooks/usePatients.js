import { useState, useEffect, useCallback } from 'react';
import { fetchAllPatients, createPatientRecord } from '../database/patientQueries.js';

export function usePatients() {
  const [patients, setPatients] = useState([]);
  const [activePatientId, setActivePatientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllPatients();
      setPatients(data);
      setActivePatientId((current) => current ?? (data[0] ? data[0].id : null));
    } catch (err) {
      console.error('Failed to load patients from Supabase:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const addPatient = useCallback(async (formInput) => {
    const newPatient = await createPatientRecord(formInput);
    setPatients((current) => [...current, newPatient]);
    setActivePatientId(newPatient.id);
    return newPatient;
  }, []);

  const activePatient = patients.find((p) => p.id === activePatientId) || null;

  return {
    patients,
    activePatient,
    activePatientId,
    setActivePatientId,
    loading,
    error,
    refresh: loadPatients,
    addPatient,
  };
}