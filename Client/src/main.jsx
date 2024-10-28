import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import { AuthProvider } from './contexts/AuthContext'
import './css/custom.css';
import './scss/custom.scss';
import MainView from './components/main-view';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <MainView />
      </AuthProvider>
    </Provider>
  </React.StrictMode>,
)

// Register service worker for offline capability
serviceWorkerRegistration.register();
