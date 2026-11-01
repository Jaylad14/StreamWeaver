import AppNavbar from './components/AppNavbar';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import RawPreview from './components/RawPreview';
import Hero from './components/Hero';
import PostUploadPanel from './components/PostUploadPanel';
import CircuitBackground from './components/CircuitBackground';
import { useState, useEffect } from "react";
import UploadZone from './components/UploadZone'
import DataGrid from './components/DataGrid'
import ColumnMapping from './components/ColumnMapping'
import ProgressBar from './components/ProgressBar'
import DataPreview from './components/DataPreview'
import InsertButton from './components/InsertButton'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  const [mappings, setMappings] = useState({});
  const [quality, setQuality] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [inserted, setInserted] = useState(false);
  const isAdmin = localStorage.getItem('sw_role') === 'admin';
  const [token, setToken] = useState(() => localStorage.getItem('sw_token'));
  const [uploadedData, setUploadedData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fileId, setFileId] = useState(null)
  const [transformedData, setTransformedData] = useState(null)
  const [customCode, setCustomCode] = useState('')
  const [rowsProcessed, setRowsProcessed] = useState(0)

  useEffect(() => {
    if (!fileId) return;
    fetch('http://localhost:5000/api/quality/' + fileId)
      .then((r) => r.json())
      .then((q) => setQuality(q))
      .catch(() => setQuality(null));
  }, [fileId]);

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

  const handleLogout = () => {
    localStorage.removeItem('sw_token');
    setToken(null);
  };

  const handleNewFile = () => {
    setUploadedData(null);
    setFileId(null);
    setTransformedData(null);
    setRowsProcessed(0);
    setCustomCode('');
    setMappings({});
    setQuality(null);
    setInserted(false);
  };

  const stepNumber = !uploadedData ? 1
    : inserted ? 5
    : transformedData ? 4
    : Object.keys(mappings).length > 0 ? 3
    : 2;

  if (token && showDashboard) {
    return <AdminDashboard onBack={() => setShowDashboard(false)} />;
  }

  if (!token) {
    return <LoginPage onLogin={setToken} />;
  }

  return (
    <div className="bg-dark text-white pb-3 pt-5 mt-4">
      <div className="container-fluid">
        <AppNavbar hasFile={!!uploadedData} onLogout={handleLogout} />
        {isAdmin && (
          <div className="text-end px-3 mb-2">
            <button type="button" className="btn btn-sm btn-outline-info" onClick={() => setShowDashboard(true)}>Admin dashboard</button>
          </div>
        )}
        

        {!uploadedData && (
          <div className="row">
            <div className="col-12">
              <div id="upload">
                <UploadZone onUpload={handleUpload} loading={loading} />
            </div>
            </div>
          </div>
        )}

        <Hero collapsed={!!uploadedData} />
        <CircuitBackground active={!!uploadedData} />
        <PostUploadPanel uploadedData={uploadedData} step={stepNumber} quality={quality} />
        {uploadedData && (
          <>

            {uploadedData && (
              <div className="row mt-4">
                <div className="col-12">
                  <div id="map">
                    {fileId && <RawPreview fileId={fileId} />}
                    <ColumnMapping columns={uploadedData.data.columns} onChange={({ mappings: m, customCode: c }) => { setMappings(m); setCustomCode(c); }} />
                </div>
                </div>
              </div>
            )}

            {fileId && uploadedData && (
              <>
                <div className="row mt-4">
                  <div className="col-12">
                    <div id="process">
                      <ProgressBar fileId={fileId} customCode={customCode} mappings={mappings} columns={uploadedData?.data?.columns || []} onComplete={handleProcessComplete} />
                  </div>
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
                        <div id="insert">
                          <InsertButton fileId={fileId} transformedData={transformedData} onComplete={() => setInserted(true)} />
                        {transformedData && (
                          <div className="text-center mt-3">
                            <button type="button" className="btn btn-outline-info" onClick={handleNewFile}>
                              Start a new file
                            </button>
                          </div>
                        )}
                      </div>
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
