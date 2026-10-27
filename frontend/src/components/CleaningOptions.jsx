import React, { useState } from 'react';

export default function CleaningOptions({ columns = [], onChange }) {
  const [removeEmptyRequired, setRemoveEmptyRequired] = useState(false);
  const [requiredColumn, setRequiredColumn] = useState(columns[0] || '');
  const [fillEmpty, setFillEmpty] = useState(false);
  const [fillColumn, setFillColumn] = useState(columns[0] || '');
  const [fillValue, setFillValue] = useState('N/A');
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [trimSpaces, setTrimSpaces] = useState(false);

  const emit = (next) => {
    if (!onChange) return;
    onChange({
      removeEmptyRequired: next.removeEmptyRequired && next.requiredColumn ? { column: next.requiredColumn } : undefined,
      fillEmpty: next.fillEmpty && next.fillColumn ? { column: next.fillColumn, value: next.fillValue || 'N/A' } : undefined,
      removeDuplicates: next.removeDuplicates,
      trimSpaces: next.trimSpaces
    });
  };

  const change = (field, setter) => (value) => {
    setter(value);
    emit({
      removeEmptyRequired, requiredColumn, fillEmpty, fillColumn, fillValue, removeDuplicates, trimSpaces,
      [field]: value
    });
  };

  const reset = () => {
    setRemoveEmptyRequired(false);
    setFillEmpty(false);
    setRemoveDuplicates(false);
    setTrimSpaces(false);
    setFillValue('N/A');
    emit({ removeEmptyRequired: false, fillEmpty: false, removeDuplicates: false, trimSpaces: false });
  };

  return (
    <div className="card border border-info border-opacity-25 bg-body-tertiary rounded-4 shadow-lg p-4 mb-4">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 className="text-info mb-1">Data cleaning</h5>
          <p className="text-body-secondary small mb-0">Every option is off by default. Nothing changes until you turn it on.</p>
        </div>
        <span className="badge text-bg-info rounded-pill">Optional</span>
      </div>

      <div className="border border-secondary border-opacity-25 rounded-3 p-3 mb-3">
        <div className="form-check form-switch mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="removeEmptyRequired"
            checked={removeEmptyRequired}
            onChange={(e) => change('removeEmptyRequired', setRemoveEmptyRequired)(e.target.checked)}
          />
          <label className="form-check-label fw-semibold" htmlFor="removeEmptyRequired">
            Remove rows where a required column is empty
          </label>
        </div>
        <div className="input-group input-group-sm" style={{ maxWidth: '380px' }}>
          <span className="input-group-text bg-body text-body-secondary">Required column</span>
          <select
            className="form-select"
            value={requiredColumn}
            disabled={!removeEmptyRequired}
            onChange={(e) => change('requiredColumn', setRequiredColumn)(e.target.value)}
          >
            {columns.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border border-secondary border-opacity-25 rounded-3 p-3 mb-3">
        <div className="form-check form-switch mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="fillEmpty"
            checked={fillEmpty}
            onChange={(e) => change('fillEmpty', setFillEmpty)(e.target.checked)}
          />
          <label className="form-check-label fw-semibold" htmlFor="fillEmpty">
            Fill empty cells with a value
          </label>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <div className="input-group input-group-sm" style={{ maxWidth: '300px' }}>
            <span className="input-group-text bg-body text-body-secondary">Column</span>
            <select
              className="form-select"
              value={fillColumn}
              disabled={!fillEmpty}
              onChange={(e) => change('fillColumn', setFillColumn)(e.target.value)}
            >
              {columns.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          <div className="input-group input-group-sm" style={{ maxWidth: '220px' }}>
            <span className="input-group-text bg-body text-body-secondary">With</span>
            <input
              type="text"
              className="form-control"
              placeholder="N/A"
              value={fillValue}
              disabled={!fillEmpty}
              onChange={(e) => change('fillValue', setFillValue)(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="border border-secondary border-opacity-25 rounded-3 p-3 mb-3">
        <div className="form-check form-switch mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="removeDuplicates"
            checked={removeDuplicates}
            onChange={(e) => change('removeDuplicates', setRemoveDuplicates)(e.target.checked)}
          />
          <label className="form-check-label fw-semibold" htmlFor="removeDuplicates">
            Remove exact duplicate rows
          </label>
        </div>
      </div>

      <div className="border border-secondary border-opacity-25 rounded-3 p-3 mb-3">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="trimSpaces"
            checked={trimSpaces}
            onChange={(e) => change('trimSpaces', setTrimSpaces)(e.target.checked)}
          />
          <label className="form-check-label fw-semibold" htmlFor="trimSpaces">
            Trim extra spaces from text cells
          </label>
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <button className="btn btn-outline-info btn-sm rounded-pill px-3" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
