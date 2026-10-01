import { useState } from 'react'

export default function InsertButton({ fileId, transformedData, onComplete }) {
  const [inserting, setInserting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

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
        if (onComplete) onComplete()
      } else {
        setError(data.error || 'Insert failed')
      }
    } catch (error) {
      console.error('Insert error:', error)
      setError(error.message)
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
        {!result && !error && (
          <button
            className="btn btn-success w-100"
            onClick={handleInsert}
            disabled={inserting || !transformedData}
          >
            {inserting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Inserting...
              </>
            ) : (
              `Insert ${transformedData ? transformedData.length : 0} Rows`
            )}
          </button>
        )}

        {result && (
          <div className="alert alert-success mb-0">
            <h6 className="alert-heading">✅ Success!</h6>
            <p className="mb-1">Inserted <strong>{result.insertedRows}</strong> rows</p>
            <small>Record ID: {result.recordId}</small>
          </div>
        )}

        {error && (
          <div className="alert alert-danger mb-0">
            <h6 className="alert-heading">❌ Error</h6>
            <p className="mb-0">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
