import {ethers, network, upgrades} from 'hardhat';
import { TokenBridgeV3 } from '../typechain-types';

async function main() {

	const tokenBridgeAddress = "0x6F1641a87D5a4042D5BE4375002aa8cFbD7ED1AA"; // Base

	const [owner] = await ethers.getSigners();

	// Upgrade TokenBridgeV3
	const TokenBridgeV3 = await ethers.getContractFactory("TokenBridgeV3");
	const tokenBridge = await upgrades.upgradeProxy(tokenBridgeAddress, TokenBridgeV3.connect(owner)) as unknown as TokenBridgeV3
	await tokenBridge.waitForDeployment()

	console.log("Bridge updated... ", tokenBridge.target)
}

main().then(console.log).catch(console.log);
