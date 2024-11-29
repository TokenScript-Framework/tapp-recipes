import {ethers, network, upgrades} from "hardhat";
import {Poap} from "../typechain-types";

async function main() {


	const chain = "sepolia";
	// const proxyAddress = "0xB1049f05e17Af7376Da187f4BdBbDB72D5F86207"; // seplia stage
	const proxyAddress = "0xcddcdc3231d062de953c94f59a335b1a4911ffdc"; // sepolia stage Oleh only

	if (chain != network.name) {
		console.log("Unsupported network to upgrade")
		return
	}

	const Souvenir = await ethers.getContractFactory("Poap");
	const nft = await upgrades.upgradeProxy(proxyAddress, Souvenir, {
		//call: {fn: "upgradeV2", args: []}
	}) as Poap;
	await nft.waitForDeployment();

	console.log(
		`contract upgraded..`
	);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});