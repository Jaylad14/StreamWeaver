import React, { useState } from 'react';

const API = 'http://localhost:5000/api/auth';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const post = async (path, body) => {
    const res = await fetch(`${API}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return { ok: res.ok, data };
  };

  const run = async (fn) => {
    setError('');
    setInfo('');
    setBusy(true);
    try {
      await fn();
    } catch {
      setError('Cannot reach the server. Is the backend running?');
    } finally {
      setBusy(false);
    }
  };

  const startCooldown = () => {
    setCooldown(60);
    const timer = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const signIn = () => run(async () => {
    const { ok, data } = await post('login', { email, password });
    if (!ok) {
      if (data.needsVerification) {
        setMode('verify');
        setInfo('Enter the verification code sent to your email.');
        return;
      }
      setError(data.error || 'Sign-in failed.');
      return;
    }
    localStorage.setItem('sw_token', data.token);
    localStorage.setItem('sw_role', data.role);
    onLogin(data.token);
  });

  const signUp = () => run(async () => {
    const { ok, data } = await post('signup', { name, email, password });
    if (!ok) {
      setError(data.error || 'Sign-up failed.');
      return;
    }
    setMode('verify');
    setInfo('Account created. Enter the 6-digit code.');
    startCooldown();
  });

  const verify = () => run(async () => {
    const { ok, data } = await post('verify', { email, code });
    if (!ok) {
      setError(data.error || 'Verification failed.');
      return;
    }
    setMode('signin');
    setCode('');
    setInfo('Email verified. Sign in to continue.');
  });

  const resend = () => run(async () => {
    const { ok, data } = await post('resend', { email });
    if (!ok) {
      setError(data.error || 'Could not send a new code.');
      return;
    }
    setInfo(data.message);
    startCooldown();
  });

  const submit = (e) => {
    e.preventDefault();
    if (mode === 'signin') signIn();
    else if (mode === 'signup') signUp();
    else verify();
  };

  const heading = { signin: 'Sign in to upload and process data', signup: 'Create your account', verify: 'Verify your email' }[mode];

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 p-3">
      <form onSubmit={submit} className="card p-4 shadow-lg border-info" style={{ width: 360 }}>
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="rounded-2 d-inline-flex align-items-center justify-content-center fw-bold text-dark bg-info" style={{ width: 30, height: 30, boxShadow: '0 0 10px rgba(34,211,238,0.5)' }}>S</span>
          <span className="fw-semibold text-info fs-5">StreamWeaver</span>
        </div>
        <p className="small text-body-secondary mb-3">{heading}</p>

        {mode === 'signup' && (
          <>
            <label className="form-label small text-body-secondary mb-1" htmlFor="su-name">Full name</label>
            <input id="su-name" name="name" className="form-control mb-3" value={name} onChange={(e) => setName(e.target.value)} required />
          </>
        )}

        {mode !== 'verify' && (
          <>
            <label className="form-label small text-body-secondary mb-1" htmlFor="login-email">Email</label>
            <input id="login-email" name="email" type="email" className="form-control mb-3" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <label className="form-label small text-body-secondary mb-1" htmlFor="login-password">Password</label>
            <input id="login-password" name="password" type="password" className="form-control mb-3" placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={mode === 'signup' ? 8 : 1} />
          </>
        )}

        {mode === 'verify' && (
          <>
            <label className="form-label small text-body-secondary mb-1" htmlFor="otp-email">Email</label>
            <input id="otp-email" name="email" type="email" className="form-control mb-3" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <label className="form-label small text-body-secondary mb-1" htmlFor="otp-code">6-digit code</label>
            <input id="otp-code" name="code" inputMode="numeric" maxLength={6} className="form-control mb-3 text-center fs-4" placeholder="000000" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required />
          </>
        )}

        <div className="small text-danger mb-1" style={{ minHeight: 18 }}>{error}</div>
        <div className="small text-info mb-2" style={{ minHeight: 18 }}>{info}</div>

        <button type="submit" className="btn btn-info w-100 fw-semibold" disabled={busy || (mode === 'verify' && code.length !== 6)}>
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Verify'}
        </button>

        {mode === 'verify' && (
          <button type="button" className="btn btn-link btn-sm mt-2 p-0" onClick={resend} disabled={busy || cooldown > 0}>
            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
          </button>
        )}

        <div className="small text-center mt-3">
          {mode === 'signin' && (
            <button type="button" className="btn btn-link btn-sm p-0" onClick={() => { setMode('signup'); setError(''); setInfo(''); }}>New here? Create an account</button>
          )}
          {mode === 'signup' && (
            <button type="button" className="btn btn-link btn-sm p-0" onClick={() => { setMode('signin'); setError(''); setInfo(''); }}>Already have an account? Sign in</button>
          )}
          {mode === 'verify' && (
            <button type="button" className="btn btn-link btn-sm p-0" onClick={() => { setMode('signin'); setError(''); setInfo(''); }}>Back to sign in</button>
          )}
        </div>
      </form>
    </div>
  );
}
