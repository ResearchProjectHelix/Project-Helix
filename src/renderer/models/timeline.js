export function createTimelineEvent({
  title,
  type,
  date,
  clinician = "",
  notes = "",
  linkedDocumentId = null,
  status = "Completed",
}) {
  return {
    id: crypto.randomUUID(),
    title,
    type,
    date,
    clinician,
    notes,
    linkedDocumentId,
    status,
    createdAt: new Date().toISOString(),
  };
}