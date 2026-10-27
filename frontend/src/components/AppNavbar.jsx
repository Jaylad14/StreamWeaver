import React from 'react';

export default function AppNavbar({ hasFile }) {
  const links = ['Upload', 'Map', 'Clean', 'Process', 'Insert'];

  return (
    <nav style={{ position: "relative", zIndex: 1 }} className="navbar navbar-expand bg-body border-bottom px-3 px-lg-4 py-2">
      <div className="container-fluid p-0 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <span className="rounded-2 d-inline-flex align-items-center justify-content-center fw-bold text-dark bg-info" style={{ width: 30, height: 30, boxShadow: '0 0 12px rgba(34,211,238,0.5)' }}>S</span>
          <span className="navbar-brand fw-semibold text-info mb-0">StreamWeaver</span>
        </div>

        <ul className="navbar-nav flex-row gap-3 d-none d-md-flex">
          {links.map((label) => (
            <li className="nav-item" key={label}>
              <span className="nav-link small text-body-secondary p-0">{label}</span>
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
