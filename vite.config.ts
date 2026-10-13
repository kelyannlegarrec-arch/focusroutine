import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// En local uniquement : fait tourner les fonctions du dossier api/
// comme Vercel le fera en ligne (ex. POST /api/checkout -> api/checkout.ts)
function apiLocale(): Plugin {
  return {
    name: 'api-locale',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        const nom = req.url?.split('?')[0].replace(/^\//, '')
        if (!nom || !/^[\w-]+$/.test(nom)) return next()
        try {
          const mod = await server.ssrLoadModule(`/api/${nom}.ts`)
          const handler = mod[req.method ?? 'GET']
          if (!handler) return next()
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const request = new Request(`http://${req.headers.host}${req.originalUrl}`, {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: chunks.length ? Buffer.concat(chunks) : undefined,
          })
          const response: Response = await handler(request)
          res.statusCode = response.status
          response.headers.forEach((valeur, cle) => res.setHeader(cle, valeur))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (e) {
          server.config.logger.error(String(e))
          res.statusCode = 500
          res.end('Erreur serveur')
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Rend les variables de .env.local lisibles par les fonctions api/ en local
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [
      // TanStack Router doit passer avant le plugin React
      tanstackRouter({ target: 'react', autoCodeSplitting: true }),
      react(),
      tailwindcss(),
      apiLocale(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }
})
