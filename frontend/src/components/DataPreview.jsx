import React, { useState, useEffect } from 'react';

const formatCell = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export default function DataPreview({ fileId, transformedData, rowsProcessed }) {
  const [previewRows, setPreviewRows] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (transformedData && transformedData.length > 0) {
      setPreviewRows(transformedData.slice(0, 10));
    }
  }, [transformedData]);

  if (!transformedData || transformedData.length === 0) {
    return null;
  }

  const columns = previewRows.length > 0 ? Object.keys(previewRows[0]) : [];

  return (
    <div className="card bg-dark border-warning mt-4">
      <div className="card-header bg-dark border-warning">
        <h5 className="card-title text-warning mb-0">
          📊 Data Preview — Showing {showAll ? transformedData.length : Math.min(10, transformedData.length)} of {transformedData.length} rows
        </h5>
        <small className="text-muted">Review transformed data before inserting to database</small>
      </div>

      <div className="card-body" style={{ maxHeight: '400px', overflowX: 'auto' }}>
        <table className="table table-dark table-sm table-striped mb-0">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} className="text-warning">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(showAll ? transformedData : previewRows).map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col} className="small">
                    {formatCell(row[col]).substring(0, 50)}
                    {formatCell(row[col]).length > 50 ? '...' : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-footer bg-dark border-warning">
        {!showAll && transformedData.length > 10 && (
          <button
            className="btn btn-sm btn-outline-warning"
            onClick={() => setShowAll(true)}
          >
            Show All {transformedData.length} Rows
          </button>
        )}
        {showAll && (
          <button
            className="btn btn-sm btn-outline-warning"
            onClick={() => setShowAll(false)}
          >
            Show First 10
          </button>
        )}
      </div>
    </div>
  );
}
