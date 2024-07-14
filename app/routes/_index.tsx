import type {
	ActionFunction,
	LinksFunction,
	MetaFunction
} from '@remix-run/node'
import { json } from '@remix-run/node'
import * as web3 from '@solana/web3.js'
import nacl from 'tweetnacl'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAccount, useSignMessage, useConnect, useDisconnect } from 'wagmi'
import { useState } from 'react'
import { Header } from '~/components/header'
import { title } from '~/config.shared'
import { formatWalletAddress } from '~/utils'
import { verifyMessage } from 'viem'
import { db, wallets } from '~/db.server/schema'
import { eq } from 'drizzle-orm'
import { BaseConnectWallet } from '~/components/base-connect-wallet'

export const meta: MetaFunction = () => {
	return [
		{ title: title() },
		{ name: 'description', content: 'Bonk of America' },
		{ name: 'twitter:card', content: 'summary_large_image' },
		{
			name: 'twitter:title',
			content: 'Bonk of America | Bonking & Financial Services'
		},
		{
			name: 'twitter:description',
			content: 'Bonk of America | Bonking & Financial Services on Solana'
		},
		{
			name: 'twitter:image',
			content: 'https://bonkfa.com/twitter.jpg'
		},
		{ name: 'twitter:url', content: 'https://bonkfa.com' }
	]
}

export const links: LinksFunction = () => [
	{
		rel: 'stylesheet',
		href: 'https://cdn.jsdelivr.net/npm/wowjs@1.1.3/css/libs/animate.css'
	}
]

// API Route
export const action: ActionFunction = async ({ request }) => {
	console.log(`request: ${JSON.stringify(request, null, 2)}`)
	if (request.method !== 'POST') {
		return json({ error: 'Method not allowed' }, { status: 405 })
	}

	const {
		solanaWallet,
		solanaMessage,
		solanaSignature,
		baseWallet,
		baseMessage,
		baseSignature
	} = await request.json()

	let solanaVerified = false
	try {
		const messageBytes = new TextEncoder().encode(solanaMessage)
		const publicKey = new web3.PublicKey(solanaWallet)
		solanaVerified = nacl.sign.detached.verify(
			messageBytes,
			Buffer.from(solanaSignature, 'hex'),
			publicKey.toBytes()
		)
	} catch (error) {
		console.error('Error verifying Solana signature:', error)
		return json({ error: 'Failed to verify Solana signature' }, { status: 400 })
	}

	let baseVerified = false
	try {
		baseVerified = await verifyMessage({
			address: baseWallet,
			message: baseMessage,
			signature: baseSignature
		})
	} catch (error) {
		console.error('Error verifying Base signature:', error)
		return json({ error: 'Failed to verify Base signature' }, { status: 400 })
	}

	if (solanaVerified && baseVerified) {
		// both wallets verified > add to database
		try {
			// Check if Solana wallet already exists
			const existingWallet = await db
				.select()
				.from(wallets)
				.where(eq(wallets.solana, solanaWallet))
				.get()

			const currentTimestamp = Math.floor(Date.now() / 1000)

			if (existingWallet) {
				// Update existing record
				await db
					.update(wallets)
					.set({ base: baseWallet, updatedAt: currentTimestamp })
					.where(eq(wallets.solana, solanaWallet))
					.run()
			} else {
				// Insert new record
				await db
					.insert(wallets)
					.values({
						solana: solanaWallet,
						base: baseWallet
					})
					.run()
			}

			return json({ registered: true })
		} catch (error) {
			console.error('Error inserting into database:', error)
			return json(
				{ error: 'Failed to store wallet information' },
				{ status: 500 }
			)
		} finally {
			console.log('registered')
			// await client.close()
		}
	} else {
		return json(
			{ registered: false, error: 'Wallet verification failed' },
			{ status: 400 }
		)
	}
}

export default function Index() {
	const { publicKey, signMessage: signSolanaMessage } = useWallet()
	const { address: baseWallet } = useAccount()
	const { signMessageAsync: signBaseMessage } = useSignMessage()
	const { connect, connectors } = useConnect()
	const [registered, setRegistered] = useState(false)

	const connectBaseWallet = () => {
		const connector = connectors[0]
		connect({ connector })
	}

	const verifyWalletsAndRegister = async () => {
		if (!publicKey || !signSolanaMessage || !baseWallet) {
			console.error('Both Solana and Base wallets must be connected')
			return
		}

		try {
			// Solana wallet verification
			const solanaMessage = `Verify Solana wallet ownership: ${Date.now()}`
			const encodedSolanaMessage = new TextEncoder().encode(solanaMessage)
			const solanaSignature = await signSolanaMessage(encodedSolanaMessage)

			// Base wallet verification
			const baseMessage = `Verify Base wallet ownership: ${Date.now()}`
			const baseSignature = await signBaseMessage({ message: baseMessage })

			// Send both verifications to the backend
			const response = await fetch('/?index', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					solanaWallet: publicKey.toString(),
					solanaMessage,
					solanaSignature: Buffer.from(solanaSignature).toString('hex'),
					baseWallet,
					baseMessage,
					baseSignature
				})
			})

			if (response.ok) {
				const result = await response.json()
				if (result.registered) {
					setRegistered(true)
				} else {
					console.error('Wallet verification failed')
				}
			} else {
				console.error('Failed to verify wallets and register')
			}
		} catch (error) {
			console.error('Error during wallet verification:', error)
		}
	}

	return (
		<div>
			<div className="header">
				<div className="md:p-0 flex flex-col items-center">
					<Header />
					<div
						id="home"
						className="relative px-4 overflow-hidden pt-[120px] md:pt-[130px] lg:pt-[160px]"
					>
						<div>
							<div className="flex flex-wrap items-center">
								<div className="w-full">
									<div
										className="hero-content wow fadeInUp mx-auto max-w-[780px] text-center"
										data-wow-delay=".2s"
									>
										<h2 className="mb-6 text-3xl font-bold leading-snug text-white sm:text-4xl sm:leading-snug lg:text-5xl lg:leading-[1.2]">
											$BONKFA Base Airdrop
										</h2>
										<p className="mx-auto mb-9 max-w-[600px] text-base font-medium text-white sm:text-lg sm:leading-[1.44]">
											$BONKFA token is expanding to Base with a pre-sale on
											Pinksale. Token holders on Solana with 2.5M tokens and up
											qualify for 1:5 airdrop of Base tokens with these simple
											steps:
											<br />
											<br />
											{publicKey
												? `Connected Solana wallet: ${formatWalletAddress(
														publicKey.toString()
												  )}`
												: 'Connect your Solana wallet above'}
											<br />
											{baseWallet
												? `Connected Base wallet: ${formatWalletAddress(
														baseWallet
												  )}`
												: 'Connect your Base wallet below and register'}
											<br />
											<b>Repeat</b> for each qualifying wallet
										</p>
										<ul className="mb-10 flex flex-wrap items-center justify-center gap-5">
											<li>
												<BaseConnectWallet />
											</li>
											
											<li>
												<button
													className="flex items-center gap-4 rounded-md bg-white/[0.12] px-6 py-[14px] text-base font-medium text-white transition duration-300 ease-in-out hover:bg-white hover:text-black"
													type="button"
													onClick={verifyWalletsAndRegister}
													disabled={!publicKey || !baseWallet}
												>
													Register Wallet
													<br />
													for Airdrop
												</button>
											</li>
										</ul>
										<div>
											<a
												id="buyTextLink"
												href="https://jup.ag/swap/SOL-BONKFA_DoxsC4PpVHiUxCKYeKSkPXVVVSJYzidZZJxW4XCFF2t"
												className="mb-4 text-center text-base font-medium text-white opacity-50 hover:opacity-100"
											>
												SOLANA CA - DoxsC4PpVHiUxCKYeKSkPXVVVSJYzidZZJxW4XCFF2t
											</a>
											<br />
											<a
												href="/"
												className="mb-4 text-center text-base font-medium text-white opacity-50 hover:opacity-100"
											>
												BASE CA - 0xD97520Cc7596cdd23c7680711cB550C343E15696
											</a>
											{registered && (
												<p className="text-xl m-8">
													Successfully registered {baseWallet} to receive
													airdrop for {publicKey?.toString()}
												</p>
											)}
											<p>&nbsp;</p>
											<div
												id="socialIcons"
												className="wow fadeInUp flex items-center justify-center gap-4 text-center"
												data-wow-delay=".3s"
											>
												<a
													href="https://t.me/BonkOfA"
													className="text-white/60 duration-300 ease-in-out hover:text-white"
													target="_blank"
													rel="noreferrer"
												>
													<svg
														fill="#ffffff"
														height="30px"
														width="30px"
														version="1.1"
														id="Telegram_1"
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 189.473 189.473"
													>
														<title>Telegram</title>
														<g>
															<path
																d="M152.531,179.476c-1.48,0-2.95-0.438-4.211-1.293l-47.641-32.316l-25.552,18.386c-2.004,1.441-4.587,1.804-6.914,0.972
                   c-2.324-0.834-4.089-2.759-4.719-5.146l-12.83-48.622L4.821,93.928c-2.886-1.104-4.8-3.865-4.821-6.955
                   c-0.021-3.09,1.855-5.877,4.727-7.02l174.312-69.36c0.791-0.336,1.628-0.53,2.472-0.582c0.302-0.018,0.605-0.018,0.906-0.001
                   c1.748,0.104,3.465,0.816,4.805,2.13c0.139,0.136,0.271,0.275,0.396,0.42c1.11,1.268,1.72,2.814,1.835,4.389
                   c0.028,0.396,0.026,0.797-0.009,1.198c-0.024,0.286-0.065,0.571-0.123,0.854L159.898,173.38c-0.473,2.48-2.161,4.556-4.493,5.523
                   C154.48,179.287,153.503,179.476,152.531,179.476z M104.862,130.579l42.437,28.785L170.193,39.24l-82.687,79.566l17.156,11.638
                   C104.731,130.487,104.797,130.533,104.862,130.579z M69.535,124.178l5.682,21.53l12.242-8.809l-16.03-10.874
                   C70.684,125.521,70.046,124.893,69.535,124.178z M28.136,86.782l31.478,12.035c2.255,0.862,3.957,2.758,4.573,5.092l3.992,15.129
                   c0.183-1.745,0.974-3.387,2.259-4.624L149.227,38.6L28.136,86.782z"
															/>
														</g>
													</svg>
												</a>

												<a
													href="https://twitter.com/BonkOfA"
													className="text-white/60 duration-300 ease-in-out hover:text-white"
													target="_blank"
													rel="noreferrer"
												>
													<svg
														fill="#ffffff"
														width="30px"
														height="30px"
														viewBox="0 0 1920 1920"
														xmlns="http://www.w3.org/2000/svg"
													>
														<title>Twitter</title>
														<path
															d="M1643.825 518.606c-14.457 11.294-22.588 28.8-21.685 47.096.565 16.377 1.017 32.753 1.017 49.355 0 530.372-373.497 1079.153-998.513 1079.153-122.203 0-242.598-24.282-355.765-71.153 136.433-22.588 266.428-82.447 374.965-173.816 17.957-15.247 24.62-39.868 16.828-62.005-7.793-22.136-28.574-37.157-52.179-37.722-105.374-2.146-200.81-62.682-256.376-157.214 38.06-1.13 79.059-7.116 109.779-16.038 24.847-7.228 41.562-30.381 40.771-56.132-.903-25.863-19.2-47.774-44.499-53.308-112.15-24.282-194.71-116.781-222.607-243.84 32.076 6.438 62.344 8.47 79.06 8.922 24.62 2.711 47.322-14.456 55.453-38.06 8.02-23.492-.226-49.582-20.442-64.151-78.042-56.245-161.619-161.167-161.619-286.42 0-30.832 3.84-61.326 11.181-90.804 195.163 217.186 461.478 348.31 743.83 363.558 18.975 1.016 34.674-6.438 46.08-19.765 11.408-13.327 15.926-31.398 12.312-48.565-5.648-25.637-8.471-52.178-8.471-79.058 0-188.951 141.063-342.664 314.428-342.664 87.19 0 168.283 37.835 228.141 106.73 13.327 15.36 34.334 22.475 54.212 18.183 28.687-6.099 56.922-13.779 84.706-23.153-16.49 16.715-34.673 31.624-54.438 44.386-22.25 14.343-31.51 42.014-22.475 66.861s34.56 39.868 60.31 36.593c14.683-1.92 29.252-4.179 43.709-7.002-18.297 17.731-37.497 34.447-57.713 50.033m261.685-199.68c-16.716-18.636-43.596-23.83-66.41-13.214-4.066 1.92-8.132 3.84-12.31 5.76 17.054-30.269 30.946-62.683 40.997-96.678 6.777-22.588-1.242-46.984-20.103-61.214-18.974-14.118-44.5-15.247-64.49-2.485-58.277 37.384-120.96 64.828-186.466 82.108-78.268-76.8-181.948-120.17-289.355-120.17-235.595 0-427.37 204.424-427.37 455.606 0 9.487.227 18.974.791 28.348C626 564.008 390.517 424.977 226.64 208.469c-11.52-15.247-30.155-23.04-49.242-22.136-19.2 1.468-36.367 12.536-45.516 29.477-37.157 68.894-56.809 147.614-56.809 227.464 0 86.626 28.687 165.007 70.25 230.739-19.426 9.035-32.98 28.574-32.98 51.388v5.195c0 139.821 49.808 261.91 133.497 344.47-9.035 2.937-17.28 8.246-23.943 15.36a56.566 56.566 0 0 0-12.537 54.326c40.772 136.997 137.788 242.145 258.41 289.807-122.88 69.571-268.688 97.129-404.443 80.753-26.541-3.953-50.485 11.858-59.633 36.028-9.261 24.282-.677 51.84 20.781 66.522 179.69 123.784 387.276 189.29 600.17 189.29 695.717 0 1111.454-606.156 1111.454-1192.095 0-8.583-.113-17.054-.339-25.524 68.555-57.149 127.51-125.365 175.737-203.069 13.214-21.345 10.842-48.903-5.986-67.538"
															fillRule="evenodd"
														/>
													</svg>
												</a>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					{/* Hero Section End */}
				</div>
			</div>
		</div>
	)
}
