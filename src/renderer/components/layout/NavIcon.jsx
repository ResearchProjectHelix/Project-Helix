const ICONS = {
  dashboard: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2" y="2" width="6" height="6" rx="1" />
      <rect x="10" y="2" width="6" height="6" rx="1" />
      <rect x="2" y="10" width="6" height="6" rx="1" />
      <rect x="10" y="10" width="6" height="6" rx="1" />
    </svg>
  ),
  patient: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="9" cy="5.5" r="3" />
      <path d="M3 16c0-3.314 2.686-6 6-6s6 2.686 6 6" />
    </svg>
  ),
  blood: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M9 2.5c-2.5 3.5-5 6.5-5 9.5a5 5 0 0 0 10 0c0-3-2.5-6-5-9.5z" />
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 2.5h7l3 3v10.5a.5.5 0 0 1-.5.5h-9.5a.5.5 0 0 1-.5-.5v-13.5a.5.5 0 0 1 .5-.5z" />
      <path d="M11 2.5v3.5h3.5" />
      <path d="M6 9.5h6M6 12h6" />
    </svg>
  ),
  timeline: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 3.5h12M3 9h12M3 14.5h8" />
      <circle cx="14" cy="14.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  documents: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3.5 3.5h7l3.5 3.5v8.5h-10.5v-12z" />
      <path d="M10.5 3.5v3.5h3.5" />
    </svg>
  ),
  mdt: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="12" cy="6" r="2.5" />
      <path d="M2.5 15c0-2.5 1.5-4 3.5-4s3.5 1.5 3.5 4M9 15c0-2.5 1.5-4 3.5-4s3.5 1.5 3.5 4" />
    </svg>
  ),
  alerts: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M9 2.5l6.5 11.5H2.5L9 2.5z" />
      <path d="M9 7.5v3.5M9 13.5h.01" />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M7 4.5l4 4.5-4 4.5" />
    </svg>
  ),
  panel: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2.5" y="3" width="5" height="12" rx="1" />
      <rect x="10.5" y="3" width="5" height="12" rx="1" />
    </svg>
  ),
  share: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="13.5" cy="4.5" r="2" />
      <circle cx="4.5" cy="9" r="2" />
      <circle cx="13.5" cy="13.5" r="2" />
      <path d="M6.3 8l5.4-2.8M6.3 10l5.4 2.8" />
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="9" cy="6" r="2.5" />
      <path d="M4 15.5c0-2.76 2.24-5 5-5s5 2.24 5 5" />
      <path d="M13.5 4.5l1 1M14.5 7.5h1.5" />
    </svg>
  ),
  signout: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M7 3.5H4.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1H7" />
      <path d="M11.5 12.5L15 9l-3.5-3.5M15 9H7" />
    </svg>
  ),
};

export default function NavIcon({ name }) {
  return <span className="nav-icon">{ICONS[name] || null}</span>;
}
