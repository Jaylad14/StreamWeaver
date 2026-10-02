import { useState } from 'react'
import UploadZone from './components/UploadZone'
import DataGrid from './components/DataGrid'
import ColumnMapping from './components/ColumnMapping'
import ProgressBar from './components/ProgressBar'
import InsertButton from './components/InsertButton'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  const [uploadedData, setUploadedData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fileId, setFileId] = useState(null)
  const [showMapping, setShowMapping] = useState(false)
  const [transformedData, setTransformedData] = useState(null)
  const [customCode, setCustomCode] = useState('')

  const handleUpload = async (file) => {
    setLoading(true)
    setUploadedData(null)
    setFileId(null)
    setTransformedData(null)
    setCustomCode('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setUploadedData(data)
      if (data.fileId) {
        setFileId(data.fileId)
      }
      setShowMapping(false)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessComplete = (data) => {
    setTransformedData(data.transformedData)
  }

  return (
    <div className="bg-dark text-white min-vh-100 py-5">
      <div className="container-fluid">
        <div className="row mb-5">
          <div className="col-12">
            <h1 className="display-4 fw-bold text-info">StreamWeaver</h1>
            <p className="text-secondary">No-Code ETL Platform</p>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <UploadZone onUpload={handleUpload} loading={loading} />
          </div>
        </div>

        {uploadedData && (
          <>
            <div className="row mt-5">
              <div className="col-12">
                <div className="card bg-dark border-info">
                  <div className="card-body">
                    <h5 className="card-title text-info">File Info</h5>
                    <div className="row">
                      <div className="col-md-3 mb-3">
                        <p className="text-muted mb-1">File Name</p>
                        <p className="text-white fw-bold">{uploadedData.file.name}</p>
                      </div>
                      <div className="col-md-3 mb-3">
                        <p className="text-muted mb-1">File Size</p>
                        <p className="text-white fw-bold">{uploadedData.file.sizeMB} MB</p>
                      </div>
                      <div className="col-md-3 mb-3">
                        <p className="text-muted mb-1">Rows</p>
                        <p className="text-white fw-bold">{uploadedData.data.rowCount}</p>
                      </div>
                      <div className="col-md-3 mb-3">
                        <p className="text-muted mb-1">Columns</p>
                        <p className="text-white fw-bold">{uploadedData.data.columns.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-12">
                <button
                  className="btn btn-info"
                  onClick={() => setShowMapping(!showMapping)}
                >
                  {showMapping ? 'Hide Mapping' : 'Show Mapping'}
                </button>
              </div>
            </div>

            {showMapping && (
              <div className="row mt-4">
                <div className="col-12">
                  <ColumnMapping columns={uploadedData.data.columns} />
                </div>
              </div>
            )}

            {fileId && uploadedData && (
              <>
                <div className="row mt-4">
                  <div className="col-12">
                    <ProgressBar fileId={fileId} customCode={customCode} onComplete={handleProcessComplete} />
                  </div>
                </div>

                {transformedData && (
                  <div className="row mt-4">
                    <div className="col-12">
                      <InsertButton fileId={fileId} transformedData={transformedData} />
                    </div>
                  </div>
                )}

                <div className="row mt-4">
                  <div className="col-12">
                    <DataGrid fileId={fileId} data={uploadedData} />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App
