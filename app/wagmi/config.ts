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
		"225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f", // safe wallet
		"4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0", // trust
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
