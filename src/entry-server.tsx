import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

// Used by scripts/prerender.mjs to write the initial HTML into dist/index.html,
// so text and images are visible before JavaScript runs.
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
