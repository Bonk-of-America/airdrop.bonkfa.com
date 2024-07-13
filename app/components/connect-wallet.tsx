import { ExitIcon } from '@radix-ui/react-icons'
import { useNavigate } from '@remix-run/react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '~/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { formatWalletAddress } from '~/utils'

const ConnectWallet = () => {
	const { select, wallets, publicKey, disconnect } = useWallet()
	const navigate = useNavigate()

	const installedWallets = wallets.filter(
		wallet => wallet.readyState === 'Installed'
	)

	const disconnectHandler = () => {
		disconnect()
		navigate('/')
	}

	return !publicKey ? (
		<div className="flex flex-col gap-4 items-center relative">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						className="w-32 h-10 px-8 py-2 focus-visible:ring-0 hover:text-white dark:text-white dark:hover:text-white"
						size="icon"
						variant="ghost"
					>
						<span className="text-white">Connect Wallet</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="mt-2">
					<DropdownMenuGroup>
						{installedWallets.length > 0 ? (
							installedWallets.map(wallet => (
								<DropdownMenuItem key={wallet.adapter.name} asChild>
									<Button
										type="button"
										key={wallet.adapter.name}
										onClick={() => {
											select(wallet.adapter.name)
										}}
										variant="ghost"
										className="w-full flex gap-2 focus-visible:ring-0 justify-start px-4 py-2 text-left cursor-pointer group"
									>
										<img
											src={wallet.adapter.icon}
											alt={wallet.adapter.name}
											className="h-6 w-6"
										/>
										<span className="group-hover:text-secondary">
											{wallet.adapter.name}
										</span>
									</Button>
								</DropdownMenuItem>
							))
						) : (
							<DropdownMenuItem asChild>
								<p className="w-[12rem]">
									No wallet found. Please download a supported Solana wallet.
								</p>
							</DropdownMenuItem>
						)}
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	) : (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					className="w-32 h-10 px-12 py-2 focus-visible:ring-0 hover:text-secondary"
					size="icon"
					variant="ghost"
				>
					<span className="text-white">
						{formatWalletAddress(publicKey.toBase58())}
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem asChild>
					<Button
						className="w-full flex gap-2 px-4 py-2 justify-start cursor-pointer group focus-visible:ring-0"
						type="button"
						variant="ghost"
						onClick={disconnectHandler}
					>
						<ExitIcon
							className="group-hover:text-secondary"
							width={20}
							height={20}
						/>
						<span className="group-hover:text-secondary">Disconnect</span>
					</Button>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export default ConnectWallet
