import React, { useState, useEffect, useRef } from 'react';
import CleaningOptions from './CleaningOptions';

export default function ProgressBar({ fileId, customCode, columns = [], onComplete }) {
  const [percentage, setPercentage] = useState(0);
  const [processed, setProcessed] = useState(0);
  const [total, setTotal] = useState(0);
  const [rowsPerSec, setRowsPerSec] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [cleaning, setCleaning] = useState({});
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(() => {
      setElapsed((Date.now() - startTimeRef.current) / 1000);
    }, 100);
    return () => clearInterval(interval);
  }, [isProcessing]);

  const remaining = rowsPerSec > 0 ? Math.max(0, (total - processed) / rowsPerSec) : 0;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const connect = () =>
    new Promise((resolve, reject) => {
      const ws = new WebSocket('ws://localhost:5000');
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'progress' && data.fileId === fileId) {
          setProcessed(data.processed);
          setTotal(data.total);
          setPercentage(data.percentage);
          setRowsPerSec(data.rowsPerSec);
        }
      };
      ws.onopen = () => resolve(ws);
      ws.onerror = () => reject(new Error('Could not connect to progress server'));
    });

  const startProcessing = async () => {
    setIsProcessing(true);
    setPercentage(0);
    setProcessed(0);
    setTotal(0);
    setRowsPerSec(0);
    setElapsed(0);
    startTimeRef.current = Date.now();

    let ws = null;
    try {
      ws = await connect();

      const response = await fetch(`http://localhost:5000/api/transform/${fileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mappings: {}, customCode: customCode || '', cleaning })
      });

      const data = await response.json();

      if (data.success) {
        setPercentage(100);
        onComplete({
          transformedData: data.transformedData,
          rowsProcessed: data.rowsProcessed,
          cleaningReport: data.cleaningReport
        });
      } else {
        alert('Transform error: ' + data.error);
      }
    } catch (error) {
      alert('Failed to start transform: ' + error.message);
    } finally {
      if (ws) ws.close();
      setIsProcessing(false);
    }
  };

  return (
    <div className="card p-4 my-4 bg-dark border-info">
      <h5 className="text-info">Process Data</h5>

      {isProcessing ? (
        <div>
          <div className="progress mb-3" style={{ height: '25px' }}>
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: percentage + '%' }}
              aria-valuenow={percentage}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {percentage}%
            </div>
          </div>

          <div className="row g-2 text-center">
            <div className="col-md-3">
              <div className="border rounded p-2">
                <div className="fw-bold">{processed.toLocaleString()} / {total.toLocaleString()}</div>
                <div className="small text-muted">Processed</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="border rounded p-2">
                <div className="fw-bold">{rowsPerSec.toLocaleString()}</div>
                <div className="small text-muted">Rows/sec</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="border rounded p-2">
                <div className="fw-bold">{formatTime(elapsed)}</div>
                <div className="small text-muted">Time Elapsed</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="border rounded p-2">
                <div className="fw-bold text-warning">{formatTime(remaining)}</div>
                <div className="small text-muted">Est. Remaining</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <CleaningOptions columns={columns} onChange={setCleaning} />
          <button className="btn btn-primary" onClick={startProcessing}>
            Start Processing
          </button>
        </div>
      )}
    </div>
  );
}
