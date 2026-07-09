import React, { useState, useEffect } from "react";

import Dashboard from "./pages/Dashboard.jsx";
import Patient from "./pages/Patient.jsx";
import Reports from "./pages/Reports.jsx";
import Timeline from "./pages/Timeline.jsx";
import BloodResults from "./pages/BloodResults.jsx";
import MDTNotes from "./pages/MDTNotes.jsx";
import Alerts from "./pages/Alerts.jsx";
import ClinicalDocuments from "./pages/ClinicalDocuments.jsx";

import AddPatientModal from "./components/patients/AddPatientModal.jsx";
import PatientSwitcher from "./components/patients/PatientSwitcher.jsx";
import LoginScreen from "./components/auth/LoginScreen.jsx";
import InviteUserModal from "./components/admin/InviteUserModal.jsx";
import BulkInviteModal from "./components/admin/BulkInviteModal.jsx";
import RequestRecordsModal from "./components/records/RequestRecordsModal.jsx";
import IncomingRequestsModal from "./components/records/IncomingRequestsModal.jsx";

import { usePatients } from "./hooks/usePatients.js";
import { useAuth } from "./hooks/useAuth.js";
import { supabase } from "./database/supabaseClient.js";

const PAGES = [
  { id: "Dashboard", label: "Dashboard", component: Dashboard },
  { id: "Patient", label: "Patient Overview", component: Patient },
  { id: "BloodResults", label: "Blood Results", component: BloodResults },
  { id: "Reports", label: "Reports", component: Reports },
  { id: "Timeline", label: "Clinical Timeline", component: Timeline },
  { id: "ClinicalDocuments", label: "Clinical Documents", component: ClinicalDocuments },
  { id: "MDTNotes", label: "MDT Notes", component: MDTNotes },
  { id: "Alerts", label: "Clinical Alerts", component: Alerts },
];

export default function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);
  const [showBulkInvite, setShowBulkInvite] = useState(false);
  const [showRequestRecords, setShowRequestRecords] = useState(false);
  const [showIncomingRequests, setShowIncomingRequests] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [myOrganizationId, setMyOrganizationId] = useState(null);

  const { session, user, loading: authLoading, signIn, signOut } = useAuth();

  const {
    patients,
    activePatient,
    setActivePatientId,
    loading,
    error,
    refresh,
    addPatient,
  } = usePatients();

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setIsPlatformAdmin(false);
      setMyOrganizationId(null);
      return;
    }

    supabase
      .from("user_profiles")
      .select("role, is_platform_admin, organization_id")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setIsAdmin(data?.role === "admin");
        setIsPlatformAdmin(!!data?.is_platform_admin);
        setMyOrganizationId(data?.organization_id || null);
      });
  }, [user]);

  const ActiveComponent =
    PAGES.find((page) => page.id === activePage)?.component || Dashboard;

  async function handleCreatePatient(form) {
    try {
      if (!form.name.trim()) {
        alert("Patient name is required.");
        return;
      }

      await addPatient(form);

      setShowAddPatient(false);

      alert("Patient created successfully.");
    } catch (err) {
      console.error(err);
      alert("Unable to create patient.");
    }
  }

  if (authLoading) {
    return null;
  }

  if (!session) {
    return <LoginScreen onSignIn={signIn} />;
  }

  return (
    <div className="app-shell">
      <nav className="sidebar">

        <div className="sidebar-title">
          Project Helix
        </div>

        <div className="sidebar-scroll">

          {/* ACTIVE PATIENT */}
          <div className="sidebar-section-title">
            Active Patient
          </div>

          {patients.length > 0 && (
            <PatientSwitcher
              patients={patients}
              activePatient={activePatient}
              onSelect={setActivePatientId}
            />
          )}

          <button
            className="primary"
            style={{ width: "100%", marginBottom: "0.5rem" }}
            onClick={() => setShowAddPatient(true)}
          >
            + New Patient
          </button>

          {/* RECORDS SHARING */}
          <div className="sidebar-section-title">
            Records Sharing
          </div>

          <button
            className="secondary"
            style={{ width: "100%", marginBottom: "0.5rem" }}
            onClick={() => setShowRequestRecords(true)}
          >
            Request Records
          </button>

          {isAdmin && (
            <button
              className="secondary"
              style={{ width: "100%", marginBottom: "0.5rem" }}
              onClick={() => setShowIncomingRequests(true)}
            >
              Incoming Requests
            </button>
          )}

          {/* ADMINISTRATION */}
          {(isAdmin || isPlatformAdmin) && (
            <>
              <div className="sidebar-section-title">
                Administration
              </div>

              {isAdmin && (
                <button
                  className="secondary"
                  style={{ width: "100%", marginBottom: "0.5rem" }}
                  onClick={() => setShowInviteUser(true)}
                >
                  + Invite User
                </button>
              )}

              {isPlatformAdmin && (
                <button
                  className="secondary"
                  style={{ width: "100%", marginBottom: "0.5rem" }}
                  onClick={() => setShowBulkInvite(true)}
                >
                  + Bulk Invite
                </button>
              )}
            </>
          )}

          {/* NAVIGATION */}
          <div className="sidebar-section-title">
            Navigation
          </div>

          {PAGES.map((page) => (
            <div
              key={page.id}
              className={`nav-item ${
                activePage === page.id ? "active" : ""
              }`}
              onClick={() => setActivePage(page.id)}
            >
              {page.label}
            </div>
          ))}

        </div>

        <div className="sidebar-footer">
          <div className="sidebar-version">
            {user?.email}
          </div>

          <div className="sidebar-build">
            Version 0.1.3
          </div>

          <button
            className="secondary"
            style={{ width: "100%", marginTop: "0.75rem" }}
            onClick={signOut}
          >
            Sign Out
          </button>
        </div>

      </nav>

      <main className="main-content">

        {loading && <p>Loading patient data...</p>}

        {!loading && error && (
          <>
            <h2>Unable to Load Patient Data</h2>
            <p>{error.message}</p>
          </>
        )}

        {!loading &&
          !error &&
          activePatient && (
            <ActiveComponent
              patient={activePatient}
              refresh={refresh}
            />
          )}

      </main>

      <AddPatientModal
        open={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        onSave={handleCreatePatient}
      />

      <InviteUserModal
        open={showInviteUser}
        onClose={() => setShowInviteUser(false)}
      />

      <BulkInviteModal
        open={showBulkInvite}
        onClose={() => setShowBulkInvite(false)}
      />

      <RequestRecordsModal
        open={showRequestRecords}
        onClose={() => setShowRequestRecords(false)}
        myOrganizationId={myOrganizationId}
      />

      <IncomingRequestsModal
        open={showIncomingRequests}
        onClose={() => setShowIncomingRequests(false)}
      />

    </div>
  );
}