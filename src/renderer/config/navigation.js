import Dashboard from "../pages/Dashboard.jsx";
import Patient from "../pages/Patient.jsx";
import BloodResults from "../pages/BloodResults.jsx";
import Reports from "../pages/Reports.jsx";
import Timeline from "../pages/Timeline.jsx";
import ClinicalDocuments from "../pages/ClinicalDocuments.jsx";
import MDTNotes from "../pages/MDTNotes.jsx";
import Alerts from "../pages/Alerts.jsx";

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
    items: [
      { id: "Alerts", label: "Clinical Alerts", icon: "alerts" },
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

export const DEFAULT_PAGE = "Dashboard";
