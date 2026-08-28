import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, resolve } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

/**
 * Dev server middleware to execute Vercel Serverless Functions (/api/*) in local dev mode.
 */
function apiDevPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
        if (!url.pathname.startsWith('/api')) {
          return next()
        }

        const cleanPath = url.pathname.replace(/^\/api\/?/, '')
        const relPath = cleanPath.endsWith('.js') ? cleanPath : `${cleanPath}.js`
        const filePath = resolve(__dirname, 'api', relPath)

        if (!fs.existsSync(filePath)) {
          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: `API route not found: ${url.pathname}` }))
          return
        }

        // Buffer body if request has content
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
          const buffers = []
          for await (const chunk of req) {
            buffers.push(chunk)
          }
          const rawBody = Buffer.concat(buffers).toString('utf8')
          if (rawBody) {
            try {
              req.body = JSON.parse(rawBody)
            } catch {
              req.body = rawBody
            }
          } else {
            req.body = {}
          }
        }

        // Provide Vercel serverless helper methods on res
        res.status = function(code) {
          this.statusCode = code
          return this
        }
        res.json = function(data) {
          if (!this.headersSent) {
            this.setHeader('Content-Type', 'application/json')
          }
          this.end(JSON.stringify(data))
          return this
        }

        try {
          const fileUrl = pathToFileURL(filePath).href + `?t=${Date.now()}`
          const mod = await import(fileUrl)
          const handler = mod.default || mod
          if (typeof handler === 'function') {
            await handler(req, res)
          } else {
            res.status(500).json({ error: 'Handler is not a function' })
          }
        } catch (err) {
          console.error(`[apiDevPlugin] Error handling ${url.pathname}:`, err)
          if (!res.headersSent) {
            res.status(500).json({ error: err.message || 'Internal Server Error' })
          }
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [
      react(),
      tailwindcss(),
      apiDevPlugin(),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('jspdf')) return 'pdf'
            if (id.includes('framer-motion')) return 'motion'
            if (id.includes('@radix-ui')) return 'radix'
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react'
          },
        },
      },
    },
  }
})
