import Dashboard from "../pages/Dashboard.jsx";
import Patient from "../pages/Patient.jsx";
import BloodResults from "../pages/BloodResults.jsx";
import Reports from "../pages/Reports.jsx";
import Timeline from "../pages/Timeline.jsx";
import ClinicalDocuments from "../pages/ClinicalDocuments.jsx";
import MDTNotes from "../pages/MDTNotes.jsx";
import Alerts from "../pages/Alerts.jsx";
import AdministrationPage from "../pages/AdministrationPage.jsx";

export const NAV_GROUPS = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { id: "Dashboard", label: "Dashboard", icon: "dashboard" },
      { id: "Patient", label: "Patient Overview", icon: "patient" },
    ],
  },
  {
    id: "clinical",
    label: "Clinical Record",
    items: [
      { id: "BloodResults", label: "Blood Results", icon: "blood" },
      { id: "Reports", label: "Reports", icon: "reports" },
      { id: "Timeline", label: "Clinical Timeline", icon: "timeline" },
      { id: "ClinicalDocuments", label: "Clinical Documents", icon: "documents" },
      { id: "MDTNotes", label: "MDT Notes", icon: "mdt" },
    ],
  },
  {
    id: "monitoring",
    label: "Monitoring",
    items: [{ id: "Alerts", label: "Clinical Alerts", icon: "alerts" }],
  },
  {
    id: "administration",
    label: "Administration",
    items: [
      {
        id: "Administration",
        label: "Administration",
        icon: "admin",
        adminOnly: true,
        patientScoped: false,
      },
    ],
  },
];

const PAGE_COMPONENTS = {
  Dashboard,
  Patient,
  BloodResults,
  Reports,
  Timeline,
  ClinicalDocuments,
  MDTNotes,
  Alerts,
  Administration: AdministrationPage,
};

export const PAGE_IDS = NAV_GROUPS.flatMap((group) =>
  group.items.map((item) => item.id)
);

export function getPageComponent(pageId) {
  return PAGE_COMPONENTS[pageId] || Dashboard;
}

export function getPageLabel(pageId) {
  for (const group of NAV_GROUPS) {
    const item = group.items.find((entry) => entry.id === pageId);
    if (item) return item.label;
  }
  return pageId;
}

function findNavItem(pageId) {
  for (const group of NAV_GROUPS) {
    const item = group.items.find((entry) => entry.id === pageId);
    if (item) return item;
  }
  return null;
}

export function isAdminOnlyPage(pageId) {
  const item = findNavItem(pageId);
  return !!item?.adminOnly;
}

export function isPatientScopedPage(pageId) {
  const item = findNavItem(pageId);
  // Existing pages default to patient-scoped; a page opts out
  // explicitly via patientScoped: false (e.g. Administration).
  return item ? item.patientScoped !== false : true;
}

export const DEFAULT_PAGE = "Dashboard";