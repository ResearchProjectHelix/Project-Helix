import React, { useState } from 'react';
import Dashboard from './pages/Dashboard.jsx';
import Patient from './pages/Patient.jsx';
import Reports from './pages/Reports.jsx';
import Timeline from './pages/Timeline.jsx';
import BloodResults from './pages/BloodResults.jsx';
import MDTNotes from './pages/MDTNotes.jsx';
import Alerts from './pages/Alerts.jsx';
import { usePatients } from './hooks/usePatients.js';

const PAGES = {
  Dashboard,
  Patient,
  Reports,
  Timeline,
  BloodResults,
  MDTNotes,
  Alerts,
};

export default function App() {
  const [activePage, setActivePage] = useState('Dashboard');
  const { patients, activePatient, setActivePatientId } = usePatients();
  const ActiveComponent = PAGES[activePage];

  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div className="sidebar-title">Project Helix</div>

        <select
          value={activePatient.id}
          onChange={(e) => setActivePatientId(e.target.value)}
          className="patient-switcher"
        >
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {Object.keys(PAGES).map((name) => (
          <div
            key={name}
            onClick={() => setActivePage(name)}
            className={`nav-item ${activePage === name ? 'active' : ''}`}
          >
            {name}
          </div>
        ))}
      </nav>
      <main className="main-content">
        <ActiveComponent patient={activePatient} />
      </main>
    </div>
  );
}