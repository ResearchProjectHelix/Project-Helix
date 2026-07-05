import { useState } from "react";

function calculateAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

function validateForm(form) {
  const errors = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (form.dob) {
    const dob = new Date(form.dob);

    if (dob > today) {
      errors.dob = "Date of birth cannot be in the future.";
    } else {
      const age = calculateAge(form.dob);
      if (age > 130) {
        errors.dob = "Please check this date of birth — age exceeds 130 years.";
      }
    }
  }

  if (form.referralDate) {
    const referralDate = new Date(form.referralDate);

    if (referralDate > today) {
      errors.referralDate = "Referral date cannot be in the future.";
    } else if (form.dob) {
      const dob = new Date(form.dob);
      if (referralDate < dob) {
        errors.referralDate = "Referral date cannot be before the date of birth.";
      }
    }
  }

  return errors;
}

export default function AddPatientModal({
  open,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    name: "",
    dob: "",
    sex: "",
    gp: "",
    referralDate: "",
    diagnosis: "",
    stage: "",
    familyHistory: "",
  });

  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    await onSave(form);

    setForm({
      name: "",
      dob: "",
      sex: "",
      gp: "",
      referralDate: "",
      diagnosis: "",
      stage: "",
      familyHistory: "",
    });
    setErrors({});
  }

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: "760px", maxWidth: "95vw" }}>

        <h2>New Patient</h2>

        <p className="page-description">
          Create a new clinical record. The Medical Record Number (MRN) is assigned automatically by the system.
        </p>

        <form onSubmit={handleSubmit}>

          {/* PERSONAL */}
          <h3>Personal Information</h3>

          <div className="patient-form-grid">

            <div>
              <label className="field-label">Full Name</label>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="field-label">Date of Birth</label>
              <input
                type="date"
                value={form.dob}
                onChange={(e) => update("dob", e.target.value)}
                required
              />
              {errors.dob && (
                <p className="field-error" style={{ color: "var(--danger, #e05252)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                  {errors.dob}
                </p>
              )}
            </div>

            <div>
              <label className="field-label">Sex</label>
              <select
                value={form.sex}
                onChange={(e) => update("sex", e.target.value)}
                required
              >
                <option value="">Select...</option>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </div>

          </div>

          {/* MRN INFO BOX */}
          <div style={{
            marginTop: "1rem",
            padding: "0.75rem",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            background: "var(--bg)",
            color: "var(--text-secondary)",
            fontSize: "0.9rem"
          }}>
            <strong>Medical Record Number:</strong> Will be automatically generated (HLX-YYYY-NNNNNN format)
          </div>

          {/* REFERRAL */}
          <h3>Referral Information</h3>

          <div className="patient-form-grid">

            <div>
              <label className="field-label">General Practitioner</label>
              <input
                value={form.gp}
                onChange={(e) => update("gp", e.target.value)}
              />
            </div>

            <div>
              <label className="field-label">Referral Date</label>
              <input
                type="date"
                value={form.referralDate}
                onChange={(e) => update("referralDate", e.target.value)}
              />
              {errors.referralDate && (
                <p className="field-error" style={{ color: "var(--danger, #e05252)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                  {errors.referralDate}
                </p>
              )}
            </div>

          </div>

          {/* CLINICAL */}
          <h3>Clinical Information</h3>

          <div className="patient-form-grid">

            <div>
              <label className="field-label">Diagnosis</label>
              <input
                value={form.diagnosis}
                onChange={(e) => update("diagnosis", e.target.value)}
              />
            </div>

            <div>
              <label className="field-label">Stage</label>
              <input
                value={form.stage}
                onChange={(e) => update("stage", e.target.value)}
              />
            </div>

          </div>

          <label className="field-label">Family History</label>
          <textarea
            rows={4}
            value={form.familyHistory}
            onChange={(e) => update("familyHistory", e.target.value)}
          />

          {/* ACTIONS */}
          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="primary">
              Create Patient
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}