import React from 'react';

export default function AppNavbar({ hasFile }) {
  const links = [
    { label: 'Upload', target: 'upload' },
    { label: 'Map', target: 'map' },
    { label: 'Clean', target: 'process' },
    { label: 'Process', target: 'process' },
    { label: 'Insert', target: 'insert' }
  ];

  const goTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="navbar navbar-expand fixed-top bg-body border-bottom px-3 px-lg-4 py-2">
      <div className="container-fluid p-0 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <span className="rounded-2 d-inline-flex align-items-center justify-content-center fw-bold text-dark bg-info" style={{ width: 30, height: 30, boxShadow: '0 0 12px rgba(34,211,238,0.5)' }}>S</span>
          <span className="navbar-brand fw-semibold text-info mb-0">StreamWeaver</span>
        </div>

        <ul className="navbar-nav flex-row gap-3 d-none d-md-flex">
          {links.map((link) => (
            <li className="nav-item" key={link.label}>
              <button
                type="button"
                className="nav-link small text-body-secondary p-0 border-0 bg-transparent"
                onClick={() => goTo(link.target)}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <span className={`badge rounded-pill ${hasFile ? 'text-bg-info' : 'text-bg-secondary'}`}>
          {hasFile ? 'File loaded' : 'Waiting for file'}
        </span>
      </div>
    </nav>
  );
}
