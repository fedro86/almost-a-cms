import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'admin-redirect',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Redirect /admin to /admin/
          if (req.url === '/admin') {
            res.writeHead(301, { Location: '/admin/' })
            res.end()
            return
          }
          next()
        })
      }
    }
  ],
  base: process.env.VITE_BASE_PATH || '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  publicDir: 'public',
})
