import { injected, walletConnect, type WalletConnectParameters } from '@wagmi/connectors'
import { base } from 'wagmi/chains'
import { createConfig, http } from 'wagmi'


//! [FIX] update project ID from https://cloud.walletconnect.com/
// ! [FIX] process.env Not Working and is Returning Undefined causing Wallet Connect to throw an Error and not work
const projectId = process.env.WC_PROJECT_ID as string

const walletConnectConfig: WalletConnectParameters = {
  projectId: projectId,
  showQrModal: true,
  qrModalOptions: {
	// more wallet ids on https://explorer.walletconnect.com/?type=wallet
	explorerRecommendedWalletIds: [
		"c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", // MetaMask ID
		"fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa", // coinbase wallet
		"ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18", // zerion
		"4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0", // trust
		"e9ff15be73584489ca4a66f64d32c4537711797e30b6660dbcb71ea72a42b1f4", // exodus
		"c03dfee351b6fcc421b4494ea33b9d4b92a984f87aa76d1663bb28705e95034a", // uniswap wallet
		"225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f", // safe wallet
		"19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927", // ledger live
	],
  },
};

export const connectors = [
	injected({ shimDisconnect: true}),
	walletConnect(walletConnectConfig),
]

export const config = createConfig({
	chains: [base],
	transports: {
		[base.id]: http()
	},
	connectors: connectors
})
