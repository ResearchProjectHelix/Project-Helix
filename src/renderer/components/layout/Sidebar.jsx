import { useState, useEffect } from "react";
import PatientSwitcher from "../patients/PatientSwitcher.jsx";
import NavIcon from "./NavIcon.jsx";
import { NAV_GROUPS } from "../../config/navigation.js";
import packageJson from "../../../../package.json";
import helixIcon from "../../../../build/icon-round.png";

const COLLAPSE_KEY = "helix-sidebar-collapsed";
const RECORDS_KEY = "helix-sidebar-records-open";

function readStoredBoolean(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return fallback;
    return value === "true";
  } catch {
    return fallback;
  }
}

function CollapsibleSection({
  id,
  label,
  icon,
  collapsed,
  open,
  onToggle,
  children,
}) {
  return (
    <div className={`sidebar-collapsible ${open ? "open" : ""}`}>
      <button
        type="button"
        className="sidebar-collapsible-trigger"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`sidebar-section-${id}`}
        title={collapsed ? label : undefined}
      >
        <NavIcon name={icon} />
        {!collapsed && <span className="sidebar-collapsible-label">{label}</span>}
        {!collapsed && (
          <span className="sidebar-collapsible-chevron" aria-hidden="true">
            <NavIcon name="chevron" />
          </span>
        )}
      </button>
      {open && (
        <div id={`sidebar-section-${id}`} className="sidebar-collapsible-body">
          {children}
        </div>
      )}
    </div>
  );
}

function filterNavGroups(isAdmin, isPlatformAdmin) {
  const showAdminItems = isAdmin || isPlatformAdmin;

  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.adminOnly || showAdminItems),
  })).filter((group) => group.items.length > 0);
}

export default function Sidebar({
  activePage,
  onNavigate,
  patients,
  activePatient,
  onSelectPatient,
  onAddPatient,
  onRequestRecords,
  onIncomingRequests,
  isAdmin,
  isPlatformAdmin,
  userEmail,
  onSignOut,
}) {
  const [collapsed, setCollapsed] = useState(() =>
    readStoredBoolean(COLLAPSE_KEY, false)
  );
  const [recordsOpen, setRecordsOpen] = useState(() =>
    readStoredBoolean(RECORDS_KEY, false)
  );

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    localStorage.setItem(RECORDS_KEY, String(recordsOpen));
  }, [recordsOpen]);

  const visibleNavGroups = filterNavGroups(isAdmin, isPlatformAdmin);

  return (
    <nav
      className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}
      aria-label="Main navigation"
    >
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <img
            src={helixIcon}
            alt=""
            className="sidebar-brand-icon"
            aria-hidden="true"
          />
          {!collapsed && (
            <div className="sidebar-brand-text-group">
              <span className="sidebar-brand-text">PRISM</span>
              <span className="sidebar-brand-subtext">Project Helix</span>
            </div>
          )}
        </div>
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <NavIcon name="panel" />
        </button>
      </div>

      <div className="sidebar-patient">
        {!collapsed && (
          <div className="sidebar-section-title">Active Patient</div>
        )}

        {patients.length > 0 ? (
          <PatientSwitcher
            patients={patients}
            activePatient={activePatient}
            onSelect={onSelectPatient}
            collapsed={collapsed}
          />
        ) : (
          !collapsed && (
            <div className="sidebar-patient-empty">No patients yet</div>
          )
        )}

        <button
          type="button"
          className="sidebar-action-btn primary"
          onClick={onAddPatient}
          title={collapsed ? "New Patient" : undefined}
        >
          {collapsed ? "+" : "+ New Patient"}
        </button>
      </div>

      <div className="sidebar-scroll">
        {visibleNavGroups.map((group) => (
          <div key={group.id} className="sidebar-nav-group">
            {!collapsed && (
              <div className="sidebar-section-title">{group.label}</div>
            )}
            <div className="sidebar-nav-list" role="list">
              {group.items.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="listitem"
                    className={`nav-item ${isActive ? "active" : ""}`}
                    onClick={() => onNavigate(item.id)}
                    aria-current={isActive ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                  >
                    <NavIcon name={item.icon} />
                    {!collapsed && (
                      <span className="nav-item-label">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="sidebar-actions">
          {collapsed ? (
            <div className="sidebar-actions-compact">
              <button
                type="button"
                className="sidebar-icon-btn"
                onClick={onRequestRecords}
                title="Request Records"
              >
                <NavIcon name="share" />
              </button>
              {isAdmin && (
                <button
                  type="button"
                  className="sidebar-icon-btn"
                  onClick={onIncomingRequests}
                  title="Incoming Requests"
                >
                  <NavIcon name="reports" />
                </button>
              )}
            </div>
          ) : (
            <CollapsibleSection
              id="records"
              label="Records Sharing"
              icon="share"
              collapsed={collapsed}
              open={recordsOpen}
              onToggle={() => setRecordsOpen((value) => !value)}
            >
              <button
                type="button"
                className="sidebar-action-btn secondary"
                onClick={onRequestRecords}
              >
                Request Records
              </button>
              {isAdmin && (
                <button
                  type="button"
                  className="sidebar-action-btn secondary"
                  onClick={onIncomingRequests}
                >
                  Incoming Requests
                </button>
              )}
            </CollapsibleSection>
          )}
        </div>
      </div>

      <div className="sidebar-footer">
        {!collapsed && (
          <>
            <div className="sidebar-user-email" title={userEmail}>
              {userEmail}
            </div>
            <div className="sidebar-build">v{packageJson.version}</div>
          </>
        )}
        <button
          type="button"
          className={`sidebar-action-btn secondary sidebar-sign-out ${collapsed ? "sidebar-icon-btn" : ""}`}
          onClick={onSignOut}
          title={collapsed ? "Sign Out" : undefined}
        >
          {collapsed ? <NavIcon name="signout" /> : "Sign Out"}
        </button>
      </div>
    </nav>
  );
}