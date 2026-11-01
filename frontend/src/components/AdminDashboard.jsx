import React, { useEffect, useState } from 'react';

export default function AdminDashboard({ onBack }) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    fetch(`http://localhost:5000/api/admin/overview?days=${days}`)
      .then((r) => r.json().then((body) => ({ ok: r.ok, body })))
      .then(({ ok, body }) => {
        if (!ok) throw new Error(body.error || 'Could not load the overview.');
        setData(body);
      })
      .catch((e) => setError(e.message));
  }, [days]);

  const kpi = (label, value, note, tone) => (
    <div className="col-6 col-lg-3">
      <div className="border rounded-3 p-3 h-100 bg-body-tertiary">
        <div className="small text-body-secondary">{label}</div>
        <div className={`fs-4 fw-semibold ${tone || ''}`}>{value}</div>
        <div className="small text-body-secondary">{note}</div>
      </div>
    </div>
  );

  const k = data?.kpis;
  const maxDaily = Math.max(1, ...(data?.daily || []).map((d) => d.rows));
  const totalTypes = (data?.fileTypes || []).reduce((sum, t) => sum + t.count, 0) || 1;

  return (
    <div className="container-fluid py-3">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div>
          <h4 className="text-info mb-0">Business overview</h4>
          <small className="text-body-secondary">All users · last {days} days</small>
        </div>
        <div className="d-flex gap-2">
          <div className="btn-group btn-group-sm" role="group">
            <button type="button" className={`btn ${days === 7 ? 'btn-info' : 'btn-outline-info'}`} onClick={() => setDays(7)}>7 days</button>
            <button type="button" className={`btn ${days === 30 ? 'btn-info' : 'btn-outline-info'}`} onClick={() => setDays(30)}>30 days</button>
          </div>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onBack}>Back to app</button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {!data && !error && <div className="text-body-secondary">Loading…</div>}

      {data && (
        <>
          <div className="row g-3 mb-4">
            {kpi('Rows inserted', k.rowsInserted.toLocaleString(), k.rowsChangePct === null ? 'No previous period' : `${k.rowsChangePct >= 0 ? '+' : ''}${k.rowsChangePct}% vs previous period`)}
            {kpi('Files processed', k.filesProcessed.toLocaleString(), 'successful uploads')}
            {kpi('Failed runs', k.failedRuns, 'processing or insert errors', k.failedRuns > 0 ? 'text-danger' : '')}
            {kpi('Active users', `${k.activeUsers} of ${k.totalUsers}`, 'users with activity in this period')}
          </div>

          <div className="row g-3 mb-4">
            <div className="col-lg-8">
              <div className="border rounded-3 p-3 h-100">
                <div className="small text-body-secondary mb-2">Rows inserted per day</div>
                {data.daily.length === 0 ? (
                  <div className="text-body-secondary small py-4 text-center">No inserts in this period yet.</div>
                ) : (
                  <div className="d-flex align-items-end gap-1" style={{ height: 160 }}>
                    {data.daily.map((d) => (
                      <div key={d.date} className="flex-fill d-flex flex-column align-items-center justify-content-end h-100" title={`${d.date}: ${d.rows.toLocaleString()} rows`}>
                        <div className="bg-info rounded-top w-100" style={{ height: `${Math.max(4, (d.rows / maxDaily) * 100)}%` }} />
                        <small className="text-body-secondary mt-1" style={{ fontSize: 10 }}>{d.date.slice(5)}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="col-lg-4">
              <div className="border rounded-3 p-3 h-100">
                <div className="small text-body-secondary mb-2">File types uploaded</div>
                {data.fileTypes.length === 0 && <div className="small text-body-secondary">No uploads yet.</div>}
                {data.fileTypes.map((t) => (
                  <div key={t.type} className="mb-2">
                    <div className="d-flex justify-content-between small">
                      <span className="text-uppercase">{t.type || 'unknown'}</span>
                      <span>{Math.round((t.count / totalTypes) * 100)}%</span>
                    </div>
                    <div className="progress" style={{ height: 6 }}>
                      <div className="progress-bar bg-info" style={{ width: `${(t.count / totalTypes) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-6">
              <div className="border rounded-3 p-3 h-100">
                <div className="small text-body-secondary mb-2">Top users by rows inserted</div>
                <table className="table table-sm table-dark mb-0">
                  <thead><tr><th>User</th><th className="text-end">Runs</th><th className="text-end">Rows</th></tr></thead>
                  <tbody>
                    {data.topUsers.length === 0 && <tr><td colSpan={3} className="text-body-secondary">No inserts yet.</td></tr>}
                    {data.topUsers.map((u) => (
                      <tr key={u.email}>
                        <td>{u.email}</td>
                        <td className="text-end">{u.runs}</td>
                        <td className="text-end">{u.rows.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="border rounded-3 p-3 h-100">
                <div className="small text-body-secondary mb-2">Recent activity</div>
                {data.recent.length === 0 && <div className="small text-body-secondary">Nothing yet.</div>}
                <ul className="list-unstyled mb-0 small">
                  {data.recent.map((r, i) => (
                    <li key={i} className="d-flex justify-content-between border-bottom py-1 gap-2">
                      <span className="text-truncate">
                        <span className="text-capitalize">{r.action}</span> · {r.fileName || '-'} · {r.rowCount.toLocaleString()} rows
                      </span>
                      <span className={r.status === 'failed' ? 'text-danger' : 'text-success'}>{r.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
