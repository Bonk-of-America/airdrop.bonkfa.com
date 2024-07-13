// import * as path from 'node:path'

// import type { Config } from 'drizzle-kit'

// const dbDir = process.env.DB_PATH
// 	? path.resolve(process.env.DB_PATH)
// 	: path.join(process.cwd(), '.database')

// export default {
// 	schema: './app/db.server/schema.ts',
// 	out: './migrations',
// 	driver: 'better-sqlite',
// 	dbCredentials: {
// 		url: path.join(dbDir, 'database.db')
// 	}
// } satisfies Config

import * as dotenv from 'dotenv'
import type { Config } from 'drizzle-kit'
dotenv.config()

export default {
	schema: './app/db.server/schema.ts',
	out: './migrations',
	driver: 'turso',
	dbCredentials: {
		url: `${process.env.TURSO_CONNECTION_URL}`,
		authToken: `${process.env.TURSO_AUTH_TOKEN}`
	}
} satisfies Config
