import { TEST_CHAINID } from "./contants";
export function isTestChain(chainId: string) {
    return chainId === TEST_CHAINID;
}

export function  addressPipe(address:string){
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}