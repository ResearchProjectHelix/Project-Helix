import { useState } from "react";
import { supabase } from "../../database/supabaseClient.js";

export default function InviteUserModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("clinician");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke("invite-user", {
        body: { email, fullName, role },
      });

      if (invokeError) throw invokeError;
      if (data?.error) throw new Error(data.error);

      setSuccess(true);
      setEmail("");
      setFullName("");
      setRole("clinician");
    } catch (err) {
      setError(err.message || "Unable to send invite.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setError("");
    setSuccess(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: "480px", maxWidth: "95vw" }}>

        <h2>Invite User</h2>

        <p className="page-description">
          The invited user will receive an email to set their own password. They will be added to your organisation automatically.
        </p>

        {success ? (
          <>
            <div
              style={{
                padding: "0.75rem",
                marginBottom: "1rem",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "0.9rem",
              }}
            >
              Invitation sent successfully.
            </div>
            <div className="modal-actions">
              <button type="button" className="primary" onClick={handleClose}>
                Done
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>

            <label className="field-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              style={{ width: "100%", marginBottom: "1rem", boxSizing: "border-box" }}
            />

            <label className="field-label">Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: "100%", marginBottom: "1rem", boxSizing: "border-box" }}
            />

            <label className="field-label">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: "100%", marginBottom: "1rem" }}
            >
              <option value="clinician">Clinician</option>
              <option value="admin">Admin</option>
            </select>

            {error && (
              <p style={{ color: "var(--danger, #e05252)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {error}
              </p>
            )}

            <div className="modal-actions">
              <button type="button" className="secondary" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="primary" disabled={submitting}>
                {submitting ? "Sending..." : "Send Invite"}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}