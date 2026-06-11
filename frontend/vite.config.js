import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Forces Vite to expose the server to the Docker network
    port: 5173, // Strictly binds to this port
    watch: {
      usePolling: true, // Crucial for Docker on Windows to detect file changes
    }
  }
})