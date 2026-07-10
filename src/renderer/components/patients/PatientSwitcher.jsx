import { useState, useRef, useEffect } from "react";

export default function PatientSwitcher({
  patients,
  activePatient,
  onSelect,
  collapsed = false,
}) {
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

  const collapsedLabel = activePatient
    ? activePatient.name?.charAt(0)?.toUpperCase() || "P"
    : "P";

  return (
    <div className="patient-switcher-container" ref={containerRef}>
      {!open && (
        <button
          type="button"
          className={`patient-switcher-trigger ${
            collapsed ? "patient-switcher-trigger--collapsed" : ""
          }`}
          onClick={() => setOpen(true)}
          title={
            collapsed && activePatient
              ? `${activePatient.name} (${activePatient.mrn})`
              : undefined
          }
        >
          {collapsed ? (
            collapsedLabel
          ) : activePatient ? (
            <>
              <div className="patient-switcher-name">
                {activePatient.name}
                {activePatient.isSharedIn && (
                  <span className="patient-switcher-badge">Shared</span>
                )}
              </div>
              <div className="patient-switcher-mrn">{activePatient.mrn}</div>
            </>
          ) : (
            <span className="patient-switcher-placeholder">Select patient...</span>
          )}
        </button>
      )}

      {open && (
        <div className="patient-switcher-dropdown">
          <input
            autoFocus
            type="text"
            className="patient-switcher-search"
            placeholder="Search by name or MRN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div className="patient-switcher-list">
            {filteredPatients.length === 0 && (
              <div className="patient-switcher-empty">No matching patients</div>
            )}

            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className={`patient-switcher-option ${
                  patient.id === activePatient?.id ? "active" : ""
                }`}
                onClick={() => handleSelect(patient.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(patient.id);
                  }
                }}
              >
                <div className="patient-switcher-option-body">
                  <div className="patient-switcher-option-name">{patient.name}</div>
                  <div className="patient-switcher-option-mrn">{patient.mrn}</div>
                </div>
                {patient.isSharedIn && (
                  <span className="patient-switcher-badge">Shared</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
