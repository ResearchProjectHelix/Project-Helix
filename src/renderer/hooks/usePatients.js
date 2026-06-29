import { useState } from 'react';
import { mockPatients } from '../models/mockPatients.js';

export function usePatients() {
  const [activePatientId, setActivePatientId] = useState(mockPatients[0].id);

  const activePatient = mockPatients.find((p) => p.id === activePatientId);

  return {
    patients: mockPatients,
    activePatient,
    activePatientId,
    setActivePatientId,
  };
}