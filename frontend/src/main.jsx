import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootswatch/dist/slate/bootstrap.min.css'
import App from './App.jsx'
import './authFetch.js'
import './theme.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
