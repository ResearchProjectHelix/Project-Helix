export const DocumentCategory = {
  IMAGING: "Imaging",
  PATHOLOGY: "Pathology",
  LABORATORY: "Laboratory",
  REFERRAL: "Referral",
  MDT: "MDT",
  DISCHARGE: "Discharge",
  OTHER: "Other",
};

export const DocumentType = {
  CT: "CT",
  MRI: "MRI",
  PET: "PET",
  HISTOPATHOLOGY: "Histopathology",
  BLOOD: "Blood Results",
  GP_REFERRAL: "GP Referral",
  MDT: "MDT Document",
  DISCHARGE: "Discharge Letter",
  OTHER: "Other",
};

export function createDocument(data) {
  return {
    id: crypto.randomUUID(),
    name: data.name,
    category: data.category,
    type: data.type,
    bodyPart: data.bodyPart || "",
    clinician: data.clinician || "",
    hospital: data.hospital || "",
    date: data.date,
    notes: data.notes || "",
    fileName: data.fileName || "",
    uploadedAt: new Date().toISOString(),
  };
}