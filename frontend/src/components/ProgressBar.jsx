import { useState, useEffect } from 'react'

export default function ProgressBar({ fileId, onComplete }) {
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [rowsPerSec, setRowsPerSec] = useState(0)
  const [processed, setProcessed] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!fileId || !isProcessing) return

    const ws = new WebSocket('ws://localhost:5000')

    ws.onopen = () => {
      console.log('WebSocket connected')
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'progress' && data.fileId === fileId) {
        setProgress(data.percentage)
        setProcessed(data.processed)
        setTotal(data.total)
        setRowsPerSec(data.rowsPerSec)

        if (data.percentage === 100) {
          setIsProcessing(false)
          if (onComplete) onComplete()
        }
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => {
      ws.close()
    }
  }, [fileId, isProcessing])

  const startProcessing = async () => {
    if (!fileId) return

    setIsProcessing(true)
    setProgress(0)
    setProcessed(0)
    setTotal(0)

    try {
      const response = await fetch(`http://localhost:5000/api/transform/${fileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mappings: {},
          customCode: null
        })
      })

      const result = await response.json()
      console.log('Transform complete:', result)
    } catch (error) {
      console.error('Transform failed:', error)
      setIsProcessing(false)
    }
  }

  if (!fileId) {
    return null
  }

  return (
    <div className="card bg-dark border-info mt-4">
      <div className="card-header bg-dark border-info">
        <h5 className="card-title text-info mb-0">Process Data</h5>
      </div>

      <div className="card-body">
        {!isProcessing && progress === 0 && (
          <button 
            className="btn btn-info w-100"
            onClick={startProcessing}
          >
            Start Processing
          </button>
        )}

        {isProcessing && (
          <>
            <div className="progress mb-3" style={{ height: '25px' }}>
              <div
                className="progress-bar bg-info"
                role="progressbar"
                style={{ width: `${progress}%` }}
                aria-valuenow={progress}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {progress}%
              </div>
            </div>

            <div className="row text-muted small">
              <div className="col-md-4">
                <p className="mb-0">Processed</p>
                <p className="text-info fw-bold">{processed} / {total}</p>
              </div>
              <div className="col-md-4">
                <p className="mb-0">Speed</p>
                <p className="text-info fw-bold">{rowsPerSec} rows/sec</p>
              </div>
              <div className="col-md-4">
                <p className="mb-0">Status</p>
                <p className="text-info fw-bold">Processing...</p>
              </div>
            </div>
          </>
        )}

        {progress === 100 && !isProcessing && (
          <div className="alert alert-success mb-0">
            ✅ Processing complete! {processed} rows processed.
          </div>
        )}
      </div>
    </div>
  )
}
