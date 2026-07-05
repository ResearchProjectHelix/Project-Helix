import { useState, useRef, useEffect } from "react";

export default function PatientSwitcher({ patients, activePatient, onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredPatients = normalizedQuery
    ? patients.filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(normalizedQuery);
        const mrnMatch = p.mrn?.toLowerCase().includes(normalizedQuery);
        return nameMatch || mrnMatch;
      })
    : patients;

  function handleSelect(patientId) {
    onSelect(patientId);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div className="patient-switcher-container" ref={containerRef} style={{ position: "relative" }}>
      {!open && (
        <button
          type="button"
          className="patient-switcher-trigger"
          onClick={() => setOpen(true)}
          style={{
            width: "100%",
            textAlign: "left",
            padding: "0.5rem 0.75rem",
            marginBottom: "0.75rem",
            borderRadius: "6px",
            border: "1px solid var(--border)",
            background: "var(--bg)",
            color: "var(--text)",
            cursor: "pointer",
          }}
        >
          {activePatient ? (
            <>
              <div style={{ fontSize: "0.9rem" }}>{activePatient.name}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                {activePatient.mrn}
              </div>
            </>
          ) : (
            <span style={{ color: "var(--text-secondary)" }}>Select patient...</span>
          )}
        </button>
      )}

      {open && (
        <div
          style={{
            marginBottom: "0.75rem",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            background: "var(--bg)",
            overflow: "hidden",
          }}
        >
          <input
            autoFocus
            type="text"
            placeholder="Search by name or MRN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.5rem 0.75rem",
              border: "none",
              borderBottom: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text)",
              outline: "none",
            }}
          />

          <div style={{ maxHeight: "240px", overflowY: "auto" }}>
            {filteredPatients.length === 0 && (
              <div
                style={{
                  padding: "0.6rem 0.75rem",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                }}
              >
                No matching patients
              </div>
            )}

            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => handleSelect(patient.id)}
                style={{
                  padding: "0.5rem 0.75rem",
                  cursor: "pointer",
                  background:
                    patient.id === activePatient?.id ? "var(--surface-hover, rgba(255,255,255,0.05))" : "transparent",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    patient.id === activePatient?.id ? "rgba(255,255,255,0.05)" : "transparent")
                }
              >
                <div style={{ fontSize: "0.9rem" }}>{patient.name}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  {patient.mrn}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}