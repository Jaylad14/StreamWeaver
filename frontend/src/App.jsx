import { useState } from 'react'
import UploadZone from './components/UploadZone'
import DataGrid from './components/DataGrid'
import './App.css'

function App() {
  const [uploadedData, setUploadedData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleUpload = async (file) => {
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setUploadedData(data)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <div className="container-fluid py-5">
        <div className="row mb-5">
          <div className="col-12">
            <h1 className="display-4 fw-bold text-white">StreamWeaver</h1>
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
            <div className="row mt-5 mb-4">
              <div className="col-12">
                <div className="card bg-dark border-secondary">
                  <div className="card-body">
                    <h5 className="card-title text-white">File Info</h5>
                    <div className="row">
                      <div className="col-md-3">
                        <p className="text-secondary mb-0">File Name</p>
                        <p className="text-white fw-bold">{uploadedData.file.name}</p>
                      </div>
                      <div className="col-md-3">
                        <p className="text-secondary mb-0">File Size</p>
                        <p className="text-white fw-bold">{uploadedData.file.sizeMB} MB</p>
                      </div>
                      <div className="col-md-3">
                        <p className="text-secondary mb-0">Rows</p>
                        <p className="text-white fw-bold">{uploadedData.data.rowCount}</p>
                      </div>
                      <div className="col-md-3">
                        <p className="text-secondary mb-0">Columns</p>
                        <p className="text-white fw-bold">{uploadedData.data.columns.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <DataGrid data={uploadedData} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
