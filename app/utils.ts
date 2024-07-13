import { User } from '@prisma/client'
import { useMatches } from '@remix-run/react'
import {
	ASSOCIATED_TOKEN_PROGRAM_ID,
	TOKEN_PROGRAM_ID
} from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import { type ClassValue, clsx } from 'clsx'
import { useMemo } from 'react'
import { twMerge } from 'tailwind-merge'

const DEFAULT_REDIRECT = '/'

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
	to: FormDataEntryValue | string | null | undefined,
	defaultRedirect: string = DEFAULT_REDIRECT
) {
	if (!to || typeof to !== 'string') {
		return defaultRedirect
	}

	if (!to.startsWith('/') || to.startsWith('//')) {
		return defaultRedirect
	}

	return to
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
	id: string
): Record<string, unknown> | undefined {
	const matchingRoutes = useMatches()
	const route = useMemo(
		() => matchingRoutes.find(route => route.id === id),
		[matchingRoutes, id]
	)
	return route?.data as Record<string, unknown>
}

function isUser(user: unknown): user is User {
	return (
		user != null &&
		typeof user === 'object' &&
		'email' in user &&
		typeof user.email === 'string'
	)
}

export function useOptionalUser(): User | undefined {
	const data = useMatchesData('root')
	if (!data || !isUser(data.user)) {
		return undefined
	}
	return data.user
}

export function useUser(): User {
	const maybeUser = useOptionalUser()
	if (!maybeUser) {
		throw new Error(
			'No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.'
		)
	}
	return maybeUser
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function validateEmail(email: unknown): email is string {
	return typeof email === 'string' && email.length > 3 && email.includes('@')
}

export function formatWalletAddress(address: string): string {
	return `${address.substring(0, 5)}...${address.substring(address.length - 5)}`
}

export async function getTokenBalance({
	tokenAddress,
	walletAddress
}: {
	tokenAddress: string
	walletAddress: string
}): Promise<number> {
	const connection = new Connection(
		process.env.RPC_ENDPOINT as string,
		'confirmed'
	)
	const tokenMintPublicKey = new PublicKey(tokenAddress)
	const walletPublicKey = new PublicKey(walletAddress)

	const associatedTokenAccountPublicKey = PublicKey.findProgramAddressSync(
		[
			walletPublicKey.toBuffer(),
			TOKEN_PROGRAM_ID.toBuffer(),
			tokenMintPublicKey.toBuffer()
		],
		ASSOCIATED_TOKEN_PROGRAM_ID
	)

	try {
		const balance = await connection.getTokenAccountBalance(
			associatedTokenAccountPublicKey[0]
		)

		if (!balance.value.uiAmount) {
			console.warn(`No ${tokenAddress} balance for ${walletAddress}`)
			return 0
		}
		return balance.value.uiAmount
	} catch (error) {
		console.error(
			`Error getting balance of ${tokenAddress} for ${walletAddress}`,
			error
		)
		return 0
	}
}

export async function getSolanaBalance(walletAddress: string): Promise<number> {
	const connection = new Connection(
		process.env.RPC_ENDPOINT as string,
		'confirmed'
	)
	const walletPublicKey = new PublicKey(walletAddress)

	try {
		return connection.getBalance(walletPublicKey)
	} catch (error) {
		console.error(`Error getting solana balance for ${walletAddress}`, error)
		return 0
	}
}
