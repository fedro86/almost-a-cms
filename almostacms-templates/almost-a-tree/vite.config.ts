import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Plugin to serve admin panel during development
function serveAdmin() {
  return {
    name: 'serve-admin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url === '/admin' || req.url === '/admin/') {
          // Serve admin/index.html
          res.setHeader('Content-Type', 'text/html')
          res.end(fs.readFileSync(path.resolve(__dirname, 'admin/index.html')))
        } else if (req.url.startsWith('/admin/assets/')) {
          // Serve admin assets (JS/CSS)
          const assetPath = req.url.replace('/admin/', 'admin/')
          const fullPath = path.resolve(__dirname, assetPath)

          if (fs.existsSync(fullPath)) {
            const ext = path.extname(fullPath)
            const contentTypes: Record<string, string> = {
              '.js': 'application/javascript',
              '.css': 'text/css',
              '.json': 'application/json',
            }
            res.setHeader('Content-Type', contentTypes[ext] || 'text/plain')
            res.end(fs.readFileSync(fullPath))
          } else {
            next()
          }
        } else if (req.url.startsWith('/admin/data/')) {
          // Redirect admin data requests to public/data/
          const dataFile = req.url.replace('/admin/data/', '')
          req.url = '/data/' + dataFile
          next()
        } else if (req.url === '/.almostacms.json') {
          // Serve .almostacms.json for admin config
          res.setHeader('Content-Type', 'application/json')
          res.end(fs.readFileSync(path.resolve(__dirname, '.almostacms.json')))
        } else {
          next()
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serveAdmin()],
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
  server: {
    // Enable file watching for data changes
    watch: {
      usePolling: false,
      ignored: ['!**/public/data/**']
    }
  }
})
