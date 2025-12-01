import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Asegúrate de cambiar 'survivor-care' por el nombre EXACTO que le pondrás al repo en GitHub
export default defineConfig({
  plugins: [react()],
  base: "/survivor-care/", 
})