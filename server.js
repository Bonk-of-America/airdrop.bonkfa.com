import { createRequestHandler } from '@remix-run/express'
import { installGlobals } from '@remix-run/node'
import compression from 'compression'
import express from 'express'
import morgan from 'morgan'

// const SESSION_SECRET = process.env.SESSION_SECRET

// if (!SESSION_SECRET) {
// 	throw new Error('The SESSION_SECRET environment variable is required')
// }

installGlobals()

const viteDevServer =
	process.env.NODE_ENV === 'production'
		? undefined
		: await import('vite').then(vite =>
				vite.createServer({
					server: { middlewareMode: true }
				})
		  )

// initialize Remix handler with Turso
const remixHandler = createRequestHandler({
	build: viteDevServer
		? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
		: () => import('./build/server/index.js'),
	async getLoadContext() {
		// Adjust this part to use your Turso-based database configuration
		const { db } = await (viteDevServer
			? viteDevServer.ssrLoadModule('./app/db.server/schema.ts')
			: import('./build/server/index2.js'))
		return {
			DB: db
			// SESSION_SECRET
		}
	}
})

const app = express()

app.use(compression())

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by')

// handle asset requests
if (viteDevServer) {
	app.use(viteDevServer.middlewares)
} else {
	// Vite fingerprints its assets so we can cache forever.
	app.use(
		'/assets',
		express.static('build/client/assets', { immutable: true, maxAge: '1y' })
	)
}

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static('build/client', { maxAge: '1h' }))

app.use(morgan('tiny'))

// handle SSR requests
app.all('*', remixHandler)

const port = process.env.PORT || 3000
app.listen(port, () =>
	console.log(`Express server listening at http://localhost:${port}`)
)
