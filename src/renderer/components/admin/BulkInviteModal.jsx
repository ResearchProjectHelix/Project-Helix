import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { supabase } from "../../database/supabaseClient.js";

function normalizeRow(raw) {
  const get = (keys) => {
    for (const key of Object.keys(raw)) {
      if (keys.includes(key.trim().toLowerCase())) return raw[key];
    }
    return "";
  };

  return {
    fullName: String(get(["name", "full name", "fullname"]) || "").trim(),
    email: String(get(["email", "e-mail"]) || "").trim(),
    organizationName: String(get(["organisation", "organization", "hospital"]) || "").trim(),
    role: String(get(["role"]) || "clinician").trim().toLowerCase(),
  };
}

export default function BulkInviteModal({ open, onClose }) {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  function resetState() {
    setRows([]);
    setFileName("");
    setParseError("");
    setResults(null);
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    resetState();
    setFileName(file.name);

    const isCsv = file.name.toLowerCase().endsWith(".csv");

    if (isCsv) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const normalized = result.data.map(normalizeRow).filter((r) => r.email);
          if (normalized.length === 0) {
            setParseError("No valid rows found. Check that your file has Name, Email, and Organisation columns.");
          }
          setRows(normalized);
        },
        error: (err) => setParseError(err.message),
      });
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const workbook = XLSX.read(evt.target.result, { type: "binary" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
          const normalized = json.map(normalizeRow).filter((r) => r.email);
          if (normalized.length === 0) {
            setParseError("No valid rows found. Check that your file has Name, Email, and Organisation columns.");
          }
          setRows(normalized);
        } catch (err) {
          setParseError("Unable to read file. Make sure it's a valid .xlsx file.");
        }
      };
      reader.readAsBinaryString(file);
    }
  }

  async function handleSendInvites() {
    setSubmitting(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("bulk-invite-users", {
        body: { rows },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResults(data.results);
    } catch (err) {
      setParseError(err.message || "Bulk invite failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    resetState();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: "640px", maxWidth: "95vw" }}>

        <h2>Bulk Invite Users</h2>

        <p className="page-description">
          Upload a CSV or Excel file with columns: Name, Email, Organisation, Role (optional).
          New organisations will be created automatically if they don't already exist.
        </p>

        {!results && (
          <>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFile}
              style={{ marginTop: "0.5rem" }}
            />

            {parseError && (
              <p style={{ color: "var(--critical)", fontSize: "0.85rem", marginTop: "0.75rem" }}>
                {parseError}
              </p>
            )}

            {rows.length > 0 && (
              <>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "1rem" }}>
                  {fileName} — {rows.length} row{rows.length !== 1 ? "s" : ""} ready to invite
                </p>

                <div style={{ maxHeight: "260px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "6px", marginTop: "0.5rem" }}>
                  <table style={{ marginTop: 0 }}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Organisation</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i}>
                          <td>{r.fullName || "—"}</td>
                          <td>{r.email}</td>
                          <td>{r.organizationName || "—"}</td>
                          <td>{r.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="modal-actions">
              <button type="button" className="secondary" onClick={handleClose}>
                Cancel
              </button>
              <button
                type="button"
                className="primary"
                disabled={rows.length === 0 || submitting}
                onClick={handleSendInvites}
              >
                {submitting ? "Sending..." : `Send ${rows.length || ""} Invite${rows.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </>
        )}

        {results && (
          <>
            <div style={{ maxHeight: "320px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "6px", marginTop: "0.5rem" }}>
              <table style={{ marginTop: 0 }}>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Organisation</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i}>
                      <td>{r.email}</td>
                      <td>{r.organization || "—"}</td>
                      <td style={{ color: r.success ? "var(--success)" : "var(--critical)" }}>
                        {r.success ? "Invited" : r.error}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-actions">
              <button type="button" className="primary" onClick={handleClose}>
                Done
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}