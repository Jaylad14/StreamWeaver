import React, { useEffect, useState } from 'react';

export default function RawPreview({ fileId }) {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!fileId) return;
    fetch(`http://localhost:5000/api/data/${fileId}?limit=5&offset=0`)
      .then((r) => r.json().then((body) => ({ ok: r.ok, body })))
      .then(({ ok, body }) => {
        if (!ok) throw new Error(body.error || 'Could not load preview.');
        setRows(body.rows || body.data || []);
        setColumns(body.columns || (body.rows && body.rows[0] ? Object.keys(body.rows[0]) : []));
      })
      .catch((e) => setError(e.message));
  }, [fileId]);

  const formatCell = (v) => (v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v));

  return (
    <div className="card bg-dark border-secondary mb-3">
      <div className="card-body">
        <div className="small text-body-secondary mb-2">First 5 rows, as uploaded</div>
        {error && <div className="alert alert-danger py-1 small mb-2">{error}</div>}
        {!error && rows.length === 0 && <div className="small text-body-secondary">Loading…</div>}
        {rows.length > 0 && (
          <div className="table-responsive">
            <table className="table table-sm table-dark mb-0 small">
              <thead>
                <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {columns.map((c) => <td key={c}>{formatCell(row[c])}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
