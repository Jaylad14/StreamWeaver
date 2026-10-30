import AppNavbar from './components/AppNavbar';
import Hero from './components/Hero';
import PostUploadPanel from './components/PostUploadPanel';
import CircuitBackground from './components/CircuitBackground';
import { useState } from 'react'
import UploadZone from './components/UploadZone'
import DataGrid from './components/DataGrid'
import ColumnMapping from './components/ColumnMapping'
import ProgressBar from './components/ProgressBar'
import DataPreview from './components/DataPreview'
import InsertButton from './components/InsertButton'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  const [mappings, setMappings] = useState({});
  const [uploadedData, setUploadedData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fileId, setFileId] = useState(null)
  const [transformedData, setTransformedData] = useState(null)
  const [customCode, setCustomCode] = useState('')
  const [rowsProcessed, setRowsProcessed] = useState(0)

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
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessComplete = (data) => {
    setTransformedData(data.transformedData)
    setRowsProcessed(data.rowsProcessed)
  }

  return (
    <div className="bg-dark text-white py-3">
      <div className="container-fluid">
        

        {!uploadedData && (
          <div className="row">
            <div className="col-12">
              <UploadZone onUpload={handleUpload} loading={loading} />
            </div>
          </div>
        )}

        <AppNavbar hasFile={!!uploadedData} />
        <Hero collapsed={!!uploadedData} />
        <CircuitBackground active={!!uploadedData} />
        <PostUploadPanel uploadedData={uploadedData} step={uploadedData ? 3 : 1} />
        {uploadedData && (
          <>

            {uploadedData && (
              <div className="row mt-4">
                <div className="col-12">
                  <ColumnMapping columns={uploadedData.data.columns} onChange={({ mappings: m, customCode: c }) => { setMappings(m); setCustomCode(c); }} />
                </div>
              </div>
            )}

            {fileId && uploadedData && (
              <>
                <div className="row mt-4">
                  <div className="col-12">
                    <ProgressBar fileId={fileId} customCode={customCode} mappings={mappings} columns={uploadedData?.data?.columns || []} onComplete={handleProcessComplete} />
                  </div>
                </div>

                {transformedData && (
                  <>
                    <div className="row mt-4">
                      <div className="col-12">
                        <DataPreview fileId={fileId} transformedData={transformedData} rowsProcessed={rowsProcessed} />
                      </div>
                    </div>

                    <div className="row mt-4">
                      <div className="col-12">
                        <InsertButton fileId={fileId} transformedData={transformedData} />
                      </div>
                    </div>
                  </>
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
