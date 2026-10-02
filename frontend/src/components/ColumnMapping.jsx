import React, { useState } from 'react';
import CustomCode from './CustomCode';

export default function ColumnMapping({ columns }) {
  const [mappings, setMappings] = useState({});
  const [customCode, setCustomCode] = useState('');

  const destinationFields = [
    'id', 'first_name', 'last_name', 'email', 'age', 'city', 'state',
    'category_preference', 'account_status', 'score', 'is_verified', 'filter_flags'
  ];

  const handleMap = (source, dest) => {
    setMappings({
      ...mappings,
      [source]: dest
    });
  };

  const handleDownload = () => {
    const config = { mappings, customCode };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mapping.json';
    a.click();
  };

  return (
    <div className="card bg-dark border-info">
      <div className="card-header bg-dark border-info">
        <h5 className="card-title text-info mb-0">Column Mapping & Transform</h5>
      </div>

      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <h6 className="text-info">Source Columns</h6>
            <div className="list-group bg-dark">
              {columns.map((col) => (
                <div key={col} className="list-group-item bg-dark border-secondary">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-light">{col}</span>
                    <span className="badge bg-info text-dark">
                      {mappings[col] ? mappings[col] : '?'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-md-6">
            <h6 className="text-info">Destination Fields</h6>
            <div className="list-group bg-dark">
              {destinationFields.map((dest) => (
                <button
                  key={dest}
                  className="list-group-item list-group-item-action bg-dark border-secondary text-info"
                  onClick={() => {
                    const source = columns[Object.values(mappings).indexOf(dest) >= 0 ? Object.keys(mappings).find(k => mappings[k] === dest) : -1];
                    if (source) {
                      handleMap(source, dest);
                    }
                  }}
                >
                  {dest}
                </button>
              ))}
            </div>
          </div>
        </div>

        <CustomCode onCodeChange={setCustomCode} />

        <button className="btn btn-success w-100 mt-3" onClick={handleDownload}>
          Download Config
        </button>
      </div>
    </div>
  );
}
