import React from 'react';

const steps = ['Upload', 'Map', 'Clean', 'Process', 'Insert'];

const formatSize = (size) => (size != null ? size + ' MB' : '-');

export default function PostUploadPanel({ uploadedData, step = 1, quality = null }) {
  const d = uploadedData || {};
  const info = d.data || {};
  const name = d.file?.name ?? '-';
  const rows = d.data?.rowCount ?? '-';
  const columns = info.columns?.length ?? '-';
  const size = formatSize(d.file?.sizeMB);
  const fmt = (n) => (typeof n === 'number' ? n.toLocaleString() : '-');

  const stats = [
    { label: 'Rows', value: typeof rows === 'number' ? rows.toLocaleString() : rows },
    { label: 'Columns', value: columns },
    { label: 'File size', value: size },
    { label: 'File name', value: name }
  ];

  const quality3 = [
    { label: 'Empty cells', value: fmt(quality?.emptyCells) },
    { label: 'Duplicate rows', value: fmt(quality?.duplicateRows) },
    { label: 'Untrimmed text', value: fmt(quality?.untrimmedText) }
  ];

  return (
    <div className="card p-4 mb-4 shadow-sm">
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        {steps.map((label, i) => {
          const n = i + 1;
          const done = n < step;
          const current = n === step;
          const color = done || current ? 'bg-info text-dark' : 'bg-body-secondary text-body-secondary';
          return (
            <React.Fragment key={label}>
              <div className="text-center">
                <div className={`rounded-circle d-inline-flex align-items-center justify-content-center fw-semibold ${color}`} style={{ width: 32, height: 32, boxShadow: current ? '0 0 12px rgba(34,211,238,0.6)' : 'none' }}>
                  {done ? '✓' : n}
                </div>
                <div className={`small mt-1 ${current ? 'text-info fw-semibold' : 'text-body-secondary'}`}>{label}</div>
              </div>
              {i < steps.length - 1 && <div className="flex-grow-1 border-top mx-2" style={{ borderColor: done ? '#22d3ee' : undefined }} />}
            </React.Fragment>
          );
        })}
      </div>

      <div className="row g-3 mb-4">
        {stats.map((s) => (
          <div className="col-6 col-lg-3" key={s.label}>
            <div className="border rounded-3 p-3 h-100 bg-body-tertiary">
              <div className="small text-body-secondary">{s.label}</div>
              <div className="fw-semibold text-truncate">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <h6 className="text-info mb-1">Data quality</h6>
      <p className="small text-body-secondary mb-3">Counted from the uploaded file, before cleaning.</p>
      <div className="row g-3">
        {quality3.map((q) => (
          <div className="col-12 col-md-4" key={q.label}>
            <div className="border rounded-3 p-3 h-100">
              <div className="small text-body-secondary">{q.label}</div>
              <div className="fw-semibold fs-5">{q.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
