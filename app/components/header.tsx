import { Link } from '@remix-run/react'

import ConnectWallet from '~/components/connect-wallet'

export function Header() {
	return (
		<header className="flex items-center justify-between md:px-4 py-2 md:py-4">
			<div
				id="top-navbar"
				className="ud-header w-full min-h-[4rem] fixed left-0 top-0 z-50"
			>
				<div className="container flex md:items-center md:space-x-4">
					<Link
						className="header-logo absolute -ml-6 md:ml-0 top-0 md:space-x-8"
						to="/"
					>
						<img
							src="/logo.gif"
							alt="Bonk of America logo"
							width={128}
							height={128}
							className="object-cover w-24 h-24 rounded-lg"
						/>
					</Link>
					<div className="flex w-full items-center justify-between py-4 md:px-4">
						<h1 className="text-xl sm:text-2xl text-white ml-[5rem] md:ml-[6rem] mr-4 md:mr-0 font-bold">
							$BONKFA
						</h1>
						<div>
							<nav
								id="navbarCollapse"
								className="absolute right-4 top-full hidden w-full rounded-lg bg-white py-5 shadow-lg dark:bg-dark-2 lg:static lg:block lg:w-full lg:max-w-full lg:bg-transparent lg:px-4 lg:py-0 lg:shadow-none dark:lg:bg-transparent xl:px-6"
							/>
						</div>
					</div>
					<div className="flex items-center md:space-x-4">
						<ConnectWallet />
					</div>
				</div>
			</div>
		</header>
	)
}
