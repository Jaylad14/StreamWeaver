import { useState } from 'react'

export default function ColumnMapping({ columns }) {
  const [mappings, setMappings] = useState({})
  const [selectedSource, setSelectedSource] = useState(null)

  const destinationFields = [
    'id', 'first_name', 'last_name', 'email', 'age', 
    'city', 'state', 'category_preference', 'account_status', 
    'score', 'is_verified', 'filter_flags'
  ]

  const handleMapColumn = (sourceCol, destCol) => {
    setMappings({
      ...mappings,
      [sourceCol]: destCol
    })
  }

  const handleRemoveMapping = (sourceCol) => {
    const newMappings = { ...mappings }
    delete newMappings[sourceCol]
    setMappings(newMappings)
  }

  const saveMapping = () => {
    const mappingData = JSON.stringify(mappings, null, 2)
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(mappingData))
    element.setAttribute('download', 'mappings.json')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="card bg-dark border-info">
      <div className="card-header bg-dark border-info d-flex justify-content-between align-items-center">
        <h5 className="text-info mb-0">Column Mapping</h5>
        <button 
          className="btn btn-sm btn-success"
          onClick={saveMapping}
        >
          Save Mappings
        </button>
      </div>

      <div className="card-body">
        <div className="row">
          <div className="col-md-5">
            <h6 className="text-info mb-3">Source Columns</h6>
            <div className="list-group" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {columns.map((col, index) => (
                <button
                  key={index}
                  type="button"
                  className={`list-group-item list-group-item-action bg-dark text-start border-secondary ${selectedSource === col ? 'active border-info' : ''}`}
                  onClick={() => setSelectedSource(col)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-white">{col}</span>
                    {mappings[col] && (
                      <span className="badge bg-success">{mappings[col]}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="col-md-2 d-flex align-items-center justify-content-center">
            <div className="text-info text-center">
              <div className="mb-2 fw-bold" style={{ fontSize: '20px' }}>→</div>
              <small className="text-muted">Map to</small>
            </div>
          </div>

          <div className="col-md-5">
            <h6 className="text-info mb-3">Destination Fields</h6>
            <div className="list-group" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {destinationFields.map((field, index) => (
                <button
                  key={index}
                  type="button"
                  className={`list-group-item list-group-item-action bg-dark text-start border-secondary ${selectedSource && mappings[selectedSource] === field ? 'active border-info' : ''}`}
                  onClick={() => selectedSource && handleMapColumn(selectedSource, field)}
                >
                  <span className="text-white">{field}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {selectedSource && mappings[selectedSource] && (
          <div className="alert alert-info mt-4 d-flex justify-content-between align-items-center mb-0">
            <div>
              <strong>{selectedSource}</strong> → <strong>{mappings[selectedSource]}</strong>
            </div>
            <button 
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleRemoveMapping(selectedSource)}
            >
              Remove
            </button>
          </div>
        )}

        <div className="mt-3 text-center">
          <p className="text-muted mb-0">
            Mapped: <span className="text-info fw-bold">{Object.keys(mappings).length}</span> / {columns.length} columns
          </p>
        </div>
      </div>
    </div>
  )
}
