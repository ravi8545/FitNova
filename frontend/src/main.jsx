import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import './styles/nutrition-premium-enhancements.css'
import './styles/Global.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider><BrowserRouter><App /></BrowserRouter></ToastProvider>
  </StrictMode>,
)
