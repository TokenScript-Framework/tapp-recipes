import {ethers, network, upgrades} from 'hardhat';
import { TokenBridgeV3 } from '../typechain-types';

let TokenBridgeV3, tokenBridge, owner, addr1, addr2;

const uniswapRouterAddress = ""; // Base

async function main() {

	[owner, addr1, addr2] = await ethers.getSigners();

	// Deploy TokenBridgeV3
	TokenBridgeV3 = await ethers.getContractFactory("TokenBridgeV3");
	tokenBridge = await upgrades.deployProxy(TokenBridgeV3.connect(owner), [uniswapRouterAddress]) as unknown as TokenBridgeV3
	await tokenBridge.waitForDeployment()

	console.log("Bridge deployed... ", tokenBridge.target)
}

main().then(console.log).catch(console.log);
