import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
	useRouteError
} from '@remix-run/react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import {
	ConnectionProvider,
	WalletProvider
} from '@solana/wallet-adapter-react'
import {
	PhantomWalletAdapter,
	SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { injected, walletConnect } from '@wagmi/connectors'
import { useMemo } from 'react'

import { GlobalPendingIndicator } from '~/components/global-pending-indicator'

export const links: LinksFunction = () => [
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap'
	}
]

import type { LinksFunction } from '@remix-run/node'
import './globals.css'

//! [FIX] update project ID from https://cloud.walletconnect.com/
const projectId = process.env.WC_PROJECT_ID

// const metamaskConfig = { target: 'metaMask', shimDisconnect: true }

const config = createConfig({
	chains: [base],
	transports: {
		[base.id]: http()
	},
	// connectors: [injected(metamaskConfig), walletConnect({ projectId })]
	connectors: [injected()]
})

// Create a react-query client
const queryClient = new QueryClient()

function App({ children }: { children: React.ReactNode }) {
	const network = WalletAdapterNetwork.Mainnet
	const endpoint = useMemo(() => clusterApiUrl(network), [network])
	const wallets = useMemo(
		() => [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })],
		[network]
	)
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<WagmiProvider config={config}>
					<QueryClientProvider client={queryClient}>
						<ConnectionProvider endpoint={endpoint}>
							<WalletProvider wallets={wallets} autoConnect>
								<GlobalPendingIndicator />
								{children}
								<ScrollRestoration />
								<Scripts />
							</WalletProvider>
						</ConnectionProvider>
					</QueryClientProvider>
				</WagmiProvider>
			</body>
		</html>
	)
}

export default function Root() {
	return (
		<App>
			<Outlet />
		</App>
	)
}

export function ErrorBoundary() {
	const error = useRouteError()
	let status = 500
	let message = 'An unexpected error occurred.'
	if (isRouteErrorResponse(error)) {
		status = error.status
		switch (error.status) {
			case 404:
				message = 'Page Not Found'
				break
		}
	} else {
		console.error(error)
	}

	return (
		<App>
			<div className="container prose py-8">
				<h1>{status}</h1>
				<p>{message}</p>
			</div>
		</App>
	)
}
