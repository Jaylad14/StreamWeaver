import { useState } from 'react'
import './UploadZone.css'

export default function UploadZone({ onUpload, loading }) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      onUpload(files[0])
    }
  }

  const handleChange = (e) => {
    const files = e.target.files
    if (files && files[0]) {
      onUpload(files[0])
    }
  }

  return (
    <div className="upload-zone">
      <div
        className={`upload-area ${dragActive ? 'active' : ''} ${loading ? 'disabled' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-input"
          onChange={handleChange}
          disabled={loading}
          style={{ display: 'none' }}
          accept=".csv,.json"
        />
        <label htmlFor="file-input" className="upload-label">
          <div className="upload-icon">📁</div>
          <h4 className="text-white mb-2">Drag & drop your file here</h4>
          <p className="text-secondary mb-3">or click to browse</p>
          <p className="text-muted small">Supports CSV and JSON files</p>
          {loading && <div className="spinner-border spinner-border-sm text-info mt-3" role="status"></div>}
        </label>
      </div>
    </div>
  )
}
