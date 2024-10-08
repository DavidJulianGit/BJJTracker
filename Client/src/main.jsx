import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext'

// Styles
import './css/custom.css';
// Components
import MainView from './components/main-view';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <MainView />
    </AuthProvider>
  </React.StrictMode>,
)
