import { useState } from "react";
import helixIcon from "../../../../build/icon-round.png";

export default function LoginScreen({ onSignIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await onSignIn(email, password);
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-brand-panel">
        <div className="login-brand-header">
          <img
            src={helixIcon}
            alt=""
            className="login-brand-icon"
            aria-hidden="true"
          />
          <div className="login-brand-title-group">
            <div className="login-brand-title">PRISM</div>
            <div className="login-brand-subtitle">Project Helix</div>
          </div>
        </div>
        <p className="login-brand-text">
          PRISM (Patient Record Integration &amp; Support Management) is a
          clinical decision support platform built to bring pathology, imaging,
          MDT discussions, and surgical notes into a single view — supporting
          the clinician, not replacing their judgement.
        </p>
        <p className="login-brand-footnote">
          Developed as a proof-of-concept in response to clinical feedback on
          fragmentation across national cancer information systems.
        </p>
      </div>

      <div className="login-form-panel">
        <div className="login-form-box">
          <form onSubmit={handleSubmit}>
            <h2>Sign In</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: 0, marginBottom: "1.5rem" }}>
              Enter your credentials to access clinical records.
            </p>

            <label className="field-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              style={{ width: "100%", marginBottom: "1rem", boxSizing: "border-box" }}
            />

            <label className="field-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", marginBottom: "1rem", boxSizing: "border-box" }}
            />

            {error && (
              <p style={{ color: "var(--critical)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {error}
              </p>
            )}

            <button type="submit" className="primary" disabled={submitting} style={{ width: "100%" }}>
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}