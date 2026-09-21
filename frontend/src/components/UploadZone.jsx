import { useState } from 'react'

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
    <div
      className={`border-2 border-info rounded p-5 text-center ${dragActive ? 'bg-info bg-opacity-10' : 'bg-dark'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      style={{ cursor: 'pointer', borderWidth: '2px !important' }}
    >
      <input
        type="file"
        id="file-input"
        onChange={handleChange}
        disabled={loading}
        style={{ display: 'none' }}
        accept=".csv,.json"
      />
      <label htmlFor="file-input" className="mb-0" style={{ cursor: 'pointer' }}>
        <div className="mb-3" style={{ fontSize: '48px' }}>📁</div>
        <h4 className="text-white mb-2">Drag & drop your file here</h4>
        <p className="text-secondary mb-2">or click to browse</p>
        <p className="text-muted small mb-0">Supports CSV and JSON files</p>
        {loading && <div className="spinner-border spinner-border-sm text-info mt-3" role="status"></div>}
      </label>
    </div>
  )
}
