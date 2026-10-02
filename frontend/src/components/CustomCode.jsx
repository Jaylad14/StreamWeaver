import React, { useState } from 'react';

export default function CustomCode({ onCodeChange }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    onCodeChange(newCode);
  };

  const templateCode = `row.transformed_field = row.email.toUpperCase();
return row;`;

  return (
    <div className="card bg-dark border-info mt-4">
      <div className="card-header bg-dark border-info">
        <h5 className="card-title text-info mb-0">Custom Transformation Code</h5>
        <small className="text-muted">Transform each row using JavaScript. Variable: <code>row</code></small>
      </div>

      <div className="card-body">
        <button
          className="btn btn-sm btn-secondary mb-3"
          onClick={() => {
            setCode(templateCode);
            onCodeChange(templateCode);
          }}
        >
          Load Example
        </button>

        <textarea
          name="customCode"
          id="customCode"
          className="form-control bg-dark text-light border-info"
          rows="8"
          value={code}
          onChange={handleCodeChange}
          placeholder="row.newField = row.oldField.toUpperCase();&#10;return row;"
          style={{ fontFamily: 'monospace', fontSize: '12px' }}
        />

        {error && (
          <div className="alert alert-danger mt-2 small mb-0">
            {error}
          </div>
        )}

        <div className="mt-3">
          <small className="text-muted">
            <strong>Tips:</strong>
            <ul className="mb-0 mt-2">
              <li>Access row fields: <code>row.fieldName</code></li>
              <li>Modify: <code>row.newField = value;</code></li>
              <li>Always end with: <code>return row;</code></li>
              <li>No external imports allowed</li>
            </ul>
          </small>
        </div>
      </div>
    </div>
  );
}
