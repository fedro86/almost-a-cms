import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isEmbed = mode === 'embed';

  return {
    plugins: [react()],

    // Base path for assets
    // Embed mode: /admin/ (for embedded admin in sites)
    // Dev mode: / (for centralized development)
    base: isEmbed ? '/admin/' : '/',

    // Build configuration
    build: {
      outDir: isEmbed ? 'dist-embed' : 'dist',
      sourcemap: !isEmbed, // No sourcemaps for embedded build

      rollupOptions: {
        output: {
          // For embed mode, create single chunks for easier deployment
          ...(isEmbed && {
            manualChunks: undefined,
          }),
        },
      },

      // Chunk size warning limit
      chunkSizeWarningLimit: 1000, // 1MB (admin is ~850KB)
    },

    // Development server
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true
        }
      }
    },

    // Define environment variables
    define: {
      __IS_EMBEDDED__: isEmbed,
    },
  };
})