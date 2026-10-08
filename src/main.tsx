import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/be-vietnam-pro/400.css'
import '@fontsource/be-vietnam-pro/500.css'
import { startTransition, StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Production builds ship prerendered HTML (scripts/prerender.mjs); the dev server does not.
// Hydrating inside a transition lets React yield between chunks instead of one long task.
if (container.firstElementChild) startTransition(() => void hydrateRoot(container, app))
else createRoot(container).render(app)
