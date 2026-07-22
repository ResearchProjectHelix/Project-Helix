import React, { useState, useEffect } from "react";

import AddPatientModal from "./components/patients/AddPatientModal.jsx";
import LoginScreen from "./components/auth/LoginScreen.jsx";
import InviteUserModal from "./components/admin/InviteUserModal.jsx";
import BulkInviteModal from "./components/admin/BulkInviteModal.jsx";
import RequestRecordsModal from "./components/records/RequestRecordsModal.jsx";
import IncomingRequestsModal from "./components/records/IncomingRequestsModal.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import { ToastProvider, useToast } from "./components/feedback/ToastContext.jsx";
import { ConfirmProvider } from "./components/feedback/ConfirmContext.jsx";

import { usePatients } from "./hooks/usePatients.js";
import { useAuth } from "./hooks/useAuth.js";
import { supabase } from "./database/supabaseClient.js";
import {
  DEFAULT_PAGE,
  PAGE_IDS,
  getPageComponent,
  getPageLabel,
  isAdminOnlyPage,
  isPatientScopedPage,
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

function AppShell() {
  const [activePage, setActivePage] = useState(readStoredPage);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);
  const [showBulkInvite, setShowBulkInvite] = useState(false);
  const [showRequestRecords, setShowRequestRecords] = useState(false);
  const [showIncomingRequests, setShowIncomingRequests] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [myOrganizationId, setMyOrganizationId] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const toast = useToast();
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
      setProfileLoaded(false);
      return;
    }

    let cancelled = false;

    supabase
      .from("user_profiles")
      .select("role, is_platform_admin, organization_id, is_active")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (cancelled) return;

        if (data && data.is_active === false) {
          // Deactivated accounts should not retain access. Toast persists
          // across the sign-out redirect since ToastProvider sits above
          // this component in the tree.
          toast.error(
            "Your account has been deactivated. Please contact your organisation administrator.",
            8000
          );
          signOut();
          return;
        }

        setIsAdmin(data?.role === "admin");
        setIsPlatformAdmin(!!data?.is_platform_admin);
        setMyOrganizationId(data?.organization_id || null);
        setProfileLoaded(true);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!profileLoaded) return;
    if (isAdminOnlyPage(activePage) && !isAdmin && !isPlatformAdmin) {
      setActivePage(DEFAULT_PAGE);
    }
  }, [profileLoaded, activePage, isAdmin, isPlatformAdmin]);

  const ActiveComponent = getPageComponent(activePage);
  const patientScoped = isPatientScopedPage(activePage);

  async function handleCreatePatient(form) {
    if (!form.name.trim()) {
      toast.error("Patient name is required.");
      return;
    }

    try {
      await addPatient(form);
      setShowAddPatient(false);
      toast.success("Patient created successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Unable to create patient.");
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
        isAdmin={isAdmin}
        isPlatformAdmin={isPlatformAdmin}
        userEmail={user?.email}
        onSignOut={signOut}
      />

      <main className="main-content">
        {!patientScoped ? (
          <ActiveComponent
            isAdmin={isAdmin}
            isPlatformAdmin={isPlatformAdmin}
            myOrganizationId={myOrganizationId}
            currentUserId={user?.id}
            onInviteUser={() => setShowInviteUser(true)}
            onBulkInvite={() => setShowBulkInvite(true)}
          />
        ) : (
          <>
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
          </>
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

export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AppShell />
      </ConfirmProvider>
    </ToastProvider>
  );
}