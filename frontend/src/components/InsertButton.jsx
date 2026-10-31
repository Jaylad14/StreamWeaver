import { useState } from 'react'

export default function InsertButton({ fileId, transformedData, onComplete }) {
  const [confirming, setConfirming] = useState(false)
  const [inserting, setInserting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const count = transformedData ? transformedData.length : 0

  const handleInsert = async () => {
    if (!fileId || !transformedData || transformedData.length === 0) {
      setError('No data to insert')
      return
    }

    setInserting(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`http://localhost:5000/api/bulkInsert/${fileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: transformedData,
          fileName: `processed-${fileId}`
        })
      })

      const data = await response.json()

      if (data.success) {
        setResult({
          insertedRows: data.insertedRows,
          recordId: data.recordId
        })
        setConfirming(false)
        if (onComplete) onComplete()
      } else {
        setError(data.error || 'Insert failed')
      }
    } catch (err) {
      console.error('Insert error:', err)
      setError(err.message)
    } finally {
      setInserting(false)
    }
  }

  return (
    <div className="card bg-dark border-info mt-4">
      <div className="card-header bg-dark border-info">
        <h5 className="card-title text-info mb-0">Insert to Database</h5>
      </div>

      <div className="card-body">
        {!result && !confirming && !error && (
          <button
            className="btn btn-success w-100"
            onClick={() => setConfirming(true)}
            disabled={!transformedData || count === 0}
          >
            Insert {count} Rows
          </button>
        )}

        {!result && confirming && (
          <div>
            <p className="mb-2">
              You are about to insert <strong>{count.toLocaleString()}</strong> rows into the
              <code> processeddatas</code> collection. This cannot be undone from this screen.
            </p>
            <div className="d-flex gap-2">
              <button className="btn btn-success" onClick={handleInsert} disabled={inserting}>
                {inserting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Inserting...
                  </>
                ) : (
                  'Confirm insert'
                )}
              </button>
              <button className="btn btn-outline-secondary" onClick={() => setConfirming(false)} disabled={inserting}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="alert alert-success mb-0">
            <h6 className="alert-heading">Success</h6>
            <p className="mb-1">Inserted <strong>{result.insertedRows.toLocaleString()}</strong> rows</p>
            <small>Record ID: {result.recordId}</small>
          </div>
        )}

        {error && (
          <div className="alert alert-danger mb-0">
            <h6 className="alert-heading">Error</h6>
            <p className="mb-2">{error}</p>
            <button className="btn btn-outline-danger btn-sm" onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
