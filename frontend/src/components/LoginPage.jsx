import React, { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Sign-in failed.');
        return;
      }
      localStorage.setItem('sw_token', data.token);
      onLogin(data.token);
    } catch {
      setError('Cannot reach the server. Is the backend running?');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 p-3">
      <form onSubmit={submit} className="card p-4 shadow-lg border-info" style={{ width: 340 }}>
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="rounded-2 d-inline-flex align-items-center justify-content-center fw-bold text-dark bg-info" style={{ width: 30, height: 30, boxShadow: '0 0 10px rgba(34,211,238,0.5)' }}>S</span>
          <span className="fw-semibold text-info fs-5">StreamWeaver</span>
        </div>
        <p className="small text-body-secondary mb-3">Sign in to upload and process data</p>

        <label className="form-label small text-body-secondary mb-1" htmlFor="login-email">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          className="form-control mb-3"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="form-label small text-body-secondary mb-1" htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          className="form-control mb-2"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="small text-danger mb-2" style={{ minHeight: 18 }}>{error}</div>

        <button type="submit" className="btn btn-info w-100 fw-semibold" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <div className="small text-body-secondary text-center mt-3">Accounts are created by an administrator</div>
      </form>
    </div>
  );
}
