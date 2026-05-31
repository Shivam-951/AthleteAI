import { BrowserRouter } from 'react-router-dom'
import { Toaster }       from 'react-hot-toast'
import { Router }        from './Router'
import '../styles/globals.css'

export function App() {
  return (
    <BrowserRouter>
      <Router />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontSize: 13,
          },
          success: { iconTheme: { primary: 'var(--green)', secondary: '#fff' } },
          error:   { iconTheme: { primary: 'var(--red)',   secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  )
}
