import { useState, useMemo } from 'react'
import './DataGrid.css'

export default function DataGrid({ data }) {
  const columns = data.data.columns

  return (
    <div className="data-grid-container">
      <div className="grid-header">
        <div className="grid-header-title">Data Preview - {data.data.rowCount} rows</div>
      </div>

      <div className="table-responsive">
        <table className="table table-dark table-striped mb-0">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="grid-column-header">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {columns.map((col, index) => (
                <td key={index} className="grid-cell">Sample Data</td>
              ))}
            </tr>
            <tr>
              {columns.map((col, index) => (
                <td key={index} className="grid-cell">Sample Data</td>
              ))}
            </tr>
            <tr>
              {columns.map((col, index) => (
                <td key={index} className="grid-cell">Sample Data</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
