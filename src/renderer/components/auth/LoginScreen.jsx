import { useState } from "react";

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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "var(--bg)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "360px",
          padding: "2rem",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          background: "var(--surface, #161a20)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "0.25rem" }}>Project Helix</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: 0, marginBottom: "1.5rem" }}>
          Sign in to access clinical records.
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
          <p style={{ color: "var(--danger, #e05252)", fontSize: "0.85rem", marginBottom: "1rem" }}>
            {error}
          </p>
        )}

        <button type="submit" className="primary" disabled={submitting} style={{ width: "100%" }}>
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}