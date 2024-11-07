import { TEST_CHAINID } from "./contants";
export function isTestChain(chainId: string) {
    return chainId === TEST_CHAINID;
}
