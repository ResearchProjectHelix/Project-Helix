import React, { useState, useEffect } from "react";

import AddPatientModal from "./components/patients/AddPatientModal.jsx";
import LoginScreen from "./components/auth/LoginScreen.jsx";
import InviteUserModal from "./components/admin/InviteUserModal.jsx";
import BulkInviteModal from "./components/admin/BulkInviteModal.jsx";
import RequestRecordsModal from "./components/records/RequestRecordsModal.jsx";
import IncomingRequestsModal from "./components/records/IncomingRequestsModal.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";

import { usePatients } from "./hooks/usePatients.js";
import { useAuth } from "./hooks/useAuth.js";
import { supabase } from "./database/supabaseClient.js";
import {
  DEFAULT_PAGE,
  PAGE_IDS,
  getPageComponent,
  getPageLabel,
} from "./config/navigation.js";

const ACTIVE_PAGE_KEY = "helix-active-page";

function readStoredPage() {
  try {
    const stored = sessionStorage.getItem(ACTIVE_PAGE_KEY);
    if (stored && PAGE_IDS.includes(stored)) return stored;
  } catch {
    // ignore storage errors
  }
  return DEFAULT_PAGE;
}

export default function App() {
  const [activePage, setActivePage] = useState(readStoredPage);
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
    try {
      sessionStorage.setItem(ACTIVE_PAGE_KEY, activePage);
    } catch {
      // ignore storage errors
    }
  }, [activePage]);

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

  const ActiveComponent = getPageComponent(activePage);

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
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        patients={patients}
        activePatient={activePatient}
        onSelectPatient={setActivePatientId}
        onAddPatient={() => setShowAddPatient(true)}
        onRequestRecords={() => setShowRequestRecords(true)}
        onIncomingRequests={() => setShowIncomingRequests(true)}
        onInviteUser={() => setShowInviteUser(true)}
        onBulkInvite={() => setShowBulkInvite(true)}
        isAdmin={isAdmin}
        isPlatformAdmin={isPlatformAdmin}
        userEmail={user?.email}
        onSignOut={signOut}
      />

      <main className="main-content">
        {loading && <p>Loading patient data...</p>}

        {!loading && error && (
          <>
            <h2>Unable to Load Patient Data</h2>
            <p>{error.message}</p>
          </>
        )}

        {!loading && !error && !activePatient && (
          <div className="main-content-empty">
            <h2>
              {patients.length === 0
                ? "No patients in your caseload"
                : "Select a patient to continue"}
            </h2>
            <p>
              {patients.length === 0
                ? "Create a new patient record using the sidebar to begin documenting clinical data."
                : `Choose a patient from the Active Patient section in the sidebar to view ${getPageLabel(
                    activePage
                  ).toLowerCase()}.`}
            </p>
          </div>
        )}

        {!loading && !error && activePatient && (
          <ActiveComponent patient={activePatient} refresh={refresh} />
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
