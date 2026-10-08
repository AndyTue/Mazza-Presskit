import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Three.js only ships with the lazily imported 3D logo (src/hero/HeroLogo3D.tsx),
// so it lands in its own chunk without extra configuration.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
