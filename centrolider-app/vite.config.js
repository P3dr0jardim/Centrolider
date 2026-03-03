import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // IMPORTANTE

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // IMPORTANTE
  ],
})
