import * as Popover from "@radix-ui/react-popover"
import { Connector, useConfig, useDisconnect } from "wagmi"
import { config } from "~/wagmi/config"


export const BaseConnectWallet = ()=>{
    const { connectors, state } = useConfig({config: config})
	const { disconnect } = useDisconnect()

    return (
        <Popover.Root>
            {
                state.status === "connected" ?
                <button type="button" className="text-black inline-flex flex-col items-center justify-center rounded-md bg-white px-7 py-[14px] text-center text-base font-medium text-dark shadow-1 transition duration-300 ease-in-out hover:bg-gray-2 hover:text-gray-600"
                    onClick={()=>disconnect()}>
                    <span>Disconnect</span><span>Base Wallet</span>
                </button>
                :
                <Popover.Trigger>
                    <button type="button" className="text-black inline-flex flex-col items-center justify-center rounded-md bg-white px-7 py-[14px] text-center text-base font-medium text-dark shadow-1 transition duration-300 ease-in-out hover:bg-gray-2 hover:text-gray-600">
                        <span>Connect</span><span>Base Wallet</span>
                    </button>
                </Popover.Trigger>
            }
            <Popover.Content className="flex gap-3 grow bg-white p-4 rounded-md mt-4 z-[100]">
                <ul className="flex flex-col gap-4">
                {
                    connectors.map((connector: Connector)=>{
                        return (
                            <li key={`connector-${connector.name}`}>
                                <Popover.Close>
                                    <button type="button" className=" text-black inline-flex gap-2 items-center justify-center rounded-md bg-white hover:bg-slate-600 hover:text-white px-7 py-[14px] text-center text-base font-medium text-dark shadow-1 transition duration-300 ease-in-out hover:bg-gray-2" onClick={()=>connector.connect()}>
                                        <span>{connector.icon && <img width={"35px"} height={"35px"} src={connector.icon} alt={connector.name} />}</span><span>{connector.name === "Injected" ? "Any Installed" : connector.name}</span>
                                    </button>
                                </Popover.Close>
                            </li>
                        )
                    })
                }
                </ul>
            </Popover.Content>
            </Popover.Root>
    )
}