import React, { useState, useEffect } from 'react';
import CustomCode from './CustomCode';

export default function ColumnMapping({ columns = [], onChange }) {
  const [mappings, setMappings] = useState({});
  const [customCode, setCustomCode] = useState('');
  const [selectedSource, setSelectedSource] = useState(null);
  const [history, setHistory] = useState([]);

  const commit = (next) => {
    setHistory((h) => [...h, mappings]);
    setMappings(next);
  };

  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const previous = h[h.length - 1];
      setMappings(previous);
      return h.slice(0, -1);
    });
  };

  const destinationFields = [
    'id', 'first_name', 'last_name', 'email', 'age', 'city', 'state',
    'category_preference', 'account_status', 'score', 'is_verified', 'filter_flags'
  ];

  useEffect(() => {
    if (onChange) onChange({ mappings, customCode });
  }, [mappings, customCode]);

  const handleDestinationClick = (dest) => {
    if (!selectedSource) return;
    const next = {};
    for (const [src, d] of Object.entries(mappings)) {
      if (d !== dest && src !== selectedSource) next[src] = d;
    }
    next[selectedSource] = dest;
    commit(next);
    setSelectedSource(null);
  };

  const clearMapping = (src) => {
    const next = { ...mappings };
    delete next[src];
    commit(next);
  };

  const usedDestinations = Object.values(mappings);

  return (
    <div className="card bg-dark border-info">
      <div className="card-header bg-dark border-info">
        <h5 className="card-title text-info mb-0">Column Mapping & Transform</h5>
      </div>

      <div className="card-body">
        <div className="d-flex justify-content-end mb-2">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={undo} disabled={history.length === 0}>
            Undo last change
          </button>
        </div>
        <p className="small text-body-secondary mb-3">
          Click a source column, then click the destination field it should map to.
        </p>

        <div className="row">
          <div className="col-md-6">
            <h6 className="text-info">Source Columns</h6>
            <div className="list-group">
              {columns.map((col) => (
                <div
                  key={col}
                  className={`list-group-item d-flex justify-content-between align-items-center bg-dark border-secondary ${selectedSource === col ? 'border-info' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedSource(selectedSource === col ? null : col)}
                >
                  <span className="text-light">{col}</span>
                  <span className="d-flex align-items-center gap-2">
                    <span className={`badge ${mappings[col] ? 'bg-info text-dark' : 'bg-secondary'}`}>
                      {mappings[col] || '?'}
                    </span>
                    {mappings[col] && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary py-0 px-1"
                        onClick={(e) => { e.stopPropagation(); clearMapping(col); }}
                      >
                        ×
                      </button>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-md-6">
            <h6 className="text-info">Destination Fields</h6>
            <div className="list-group">
              {destinationFields.map((dest) => (
                <button
                  key={dest}
                  type="button"
                  className={`list-group-item list-group-item-action bg-dark border-secondary d-flex justify-content-between align-items-center ${usedDestinations.includes(dest) ? 'text-info' : 'text-light'}`}
                  disabled={!selectedSource}
                  onClick={() => handleDestinationClick(dest)}
                >
                  {dest}
                  {usedDestinations.includes(dest) && <span className="badge bg-info text-dark">mapped</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <CustomCode onCodeChange={setCustomCode} />
        </div>
      </div>
    </div>
  );
}
