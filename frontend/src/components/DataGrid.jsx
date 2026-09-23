import { useState, useEffect } from 'react'

export default function DataGrid({ fileId, data }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [startIndex, setStartIndex] = useState(0)
  const [error, setError] = useState(null)
  
  if (!data || !data.data) {
    console.log('No data prop');
    return <div className="text-muted">No data loaded</div>
  }

  const columns = data.data.columns || []
  const rowsPerPage = 50

  useEffect(() => {
    console.log('useEffect triggered, fileId:', fileId);
    if (fileId) {
      fetchData(0)
    }
  }, [fileId])

  const fetchData = async (offset) => {
    if (!fileId) {
      console.log('No fileId');
      return
    }
    
    console.log('Fetching data for fileId:', fileId, 'offset:', offset);
    setLoading(true)
    setError(null)
    try {
      const url = `http://localhost:5000/api/data/${fileId}?limit=${rowsPerPage}&offset=${offset}`;
      console.log('Fetch URL:', url);
      
      const response = await fetch(url)
      console.log('Response status:', response.status);
      
      const result = await response.json()
      console.log('Response data:', result);
      
      if (result.rows) {
        console.log('Setting rows:', result.rows.length);
        setRows(result.rows)
        setStartIndex(offset)
      } else if (result.error) {
        console.log('Error from API:', result.error);
        setError(result.error)
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePrevious = () => {
    if (startIndex > 0) {
      fetchData(Math.max(0, startIndex - rowsPerPage))
    }
  }

  const handleNext = () => {
    if (startIndex + rowsPerPage < data.data.rowCount) {
      fetchData(startIndex + rowsPerPage)
    }
  }

  console.log('Rendering DataGrid, rows:', rows.length, 'columns:', columns.length);

  if (error) {
    return <div className="alert alert-danger">{error}</div>
  }

  if (!fileId) {
    return <div className="text-muted">Waiting for file ID...</div>
  }

  return (
    <div className="card bg-dark border-info mt-4">
      <div className="card-header bg-dark border-info">
        <h5 className="card-title text-info mb-0">
          Data Preview - Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, data.data.rowCount)} of {data.data.rowCount} rows
        </h5>
      </div>

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-dark table-striped mb-0">
            <thead>
              <tr>
                {columns.map((col, index) => (
                  <th key={index} className="text-info bg-dark">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-info" role="status"></div>
                  </td>
                </tr>
              ) : rows.length > 0 ? (
                rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="text-white">
                        {String(row[col] || '-').substring(0, 100)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-4 text-muted">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-footer bg-dark border-info d-flex justify-content-center align-items-center gap-3">
        <button 
          className="btn btn-sm btn-outline-info"
          onClick={handlePrevious}
          disabled={startIndex === 0 || loading}
        >
          Previous
        </button>
        <span className="text-muted">
          Page {Math.floor(startIndex / rowsPerPage) + 1}
        </span>
        <button 
          className="btn btn-sm btn-outline-info"
          onClick={handleNext}
          disabled={startIndex + rowsPerPage >= data.data.rowCount || loading}
        >
          Next
        </button>
      </div>
    </div>
  )
}
