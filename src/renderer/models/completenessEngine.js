// Clinical Completeness Engine
//
// This does NOT diagnose or interpret clinical findings. It only checks
// whether expected documentation/data exists for a patient on the
// pancreatic cancer pathway, per Project Helix's core philosophy:
// "Reduce the chance that important information is missed."

function timelineEventStatus(timeline, label) {
  const event = timeline.find((t) => t.label === label);
  return event ? event.status : 'Pending';
}

function buildRules(patient) {
  const { bloods, reports, timeline, familyHistory } = patient;

  const ca19_9 = bloods.find((b) => b.test === 'CA19-9');
  const ca19_9Recorded = !!ca19_9 && ca19_9.value !== 'Not recorded';

  const pathologyReport = reports.find((r) => r.type.includes('Pathology'));
  const pathologyAvailable = !!pathologyReport && pathologyReport.status === 'Available';
  const histopathologyEventCompleted = timelineEventStatus(timeline, 'Histopathology') === 'Completed';

  const familyHistoryRecorded = !!familyHistory && familyHistory !== 'Not yet recorded';

  return [
    {
      key: 'gp_referral',
      label: 'GP Referral',
      met: timelineEventStatus(timeline, 'GP Referral') === 'Completed',
      priority: 'medium',
      reason: 'GP referral has not been confirmed as received.',
      evidence: 'No completed "GP Referral" event found on the diagnostic timeline.',
      suggestedAction: 'Confirm referral letter has been received and mark the timeline event complete.',
    },
    {
      key: 'ct_scan',
      label: 'CT Scan',
      met: timelineEventStatus(timeline, 'CT Scan') === 'Completed',
      priority: 'medium',
      reason: 'CT imaging has not been confirmed as completed.',
      evidence: 'No completed "CT Scan" event found on the diagnostic timeline.',
      suggestedAction: 'Confirm CT has been performed and update the timeline event status.',
    },
    {
      key: 'mri',
      label: 'MRI',
      met: timelineEventStatus(timeline, 'MRI Scan') === 'Completed',
      priority: 'medium',
      reason: 'MRI has not been confirmed as completed.',
      evidence: 'No completed "MRI Scan" event found on the diagnostic timeline.',
      suggestedAction: 'Confirm MRI has been performed and update the timeline event status.',
    },
    {
      key: 'histopathology',
      label: 'Histopathology',
      met: histopathologyEventCompleted || pathologyAvailable,
      priority: 'high',
      reason: 'Histopathology result is not available.',
      evidence: 'No completed "Histopathology" event found and no pathology report marked "Available".',
      suggestedAction: 'Upload the histopathology report once available, and mark the timeline event complete.',
    },
    {
      key: 'ca19_9',
      label: 'CA19-9',
      met: ca19_9Recorded,
      priority: 'high',
      reason: 'Tumour marker (CA19-9) result not recorded.',
      evidence: 'Blood results show CA19-9 as "Not recorded" or missing entirely.',
      suggestedAction: 'Request CA19-9 bloods if not already taken, and record the result once available.',
    },
    {
      key: 'mdt_review',
      label: 'MDT Review',
      met: timelineEventStatus(timeline, 'MDT Review') === 'Completed',
      priority: 'high',
      reason: 'Patient has not yet been discussed at MDT.',
      evidence: 'No completed "MDT Review" event found on the diagnostic timeline.',
      suggestedAction: 'Schedule or confirm MDT discussion before finalising the management plan.',
    },
    {
      key: 'family_history',
      label: 'Family History',
      met: familyHistoryRecorded,
      priority: 'medium',
      reason: 'Family history has not been recorded.',
      evidence: 'Patient record shows family history as "Not yet recorded".',
      suggestedAction: 'Take and record a family history at the next clinical contact.',
    },
  ];
}

export function evaluatePatientCompleteness(patient) {
  const rules = buildRules(patient);
  const metCount = rules.filter((r) => r.met).length;
  const percentage = Math.round((metCount / rules.length) * 100);

  const missing = rules
    .filter((r) => !r.met)
    .map((r) => ({
      key: r.key,
      text: r.label,
      severity: r.priority,
      reason: r.reason,
      evidence: r.evidence,
      suggestedAction: r.suggestedAction,
    }));

  return {
    percentage,
    totalChecks: rules.length,
    metChecks: metCount,
    missing,
  };
}