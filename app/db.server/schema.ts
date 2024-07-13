import dotenv from 'dotenv'
dotenv.config()
import { createClient } from '@libsql/client'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/libsql'
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export type DB = BaseSQLiteDatabase<'async' | 'sync', unknown, typeof schema>

export const wallets = sqliteTable('wallets', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	solana: text('solana').notNull().unique(),
	base: text('base').notNull(),
	createdAt: integer('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: integer('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull()
})

const schema = {
	wallets
}

const turso = createClient({
	url: `${process.env.TURSO_CONNECTION_URL}`,
	authToken: `${process.env.TURSO_AUTH_TOKEN}`
})

export const db = drizzle(turso, { schema })

export default schema
