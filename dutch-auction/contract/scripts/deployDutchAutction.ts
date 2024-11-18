import { ethers, upgrades } from 'hardhat';
const hre = require('hardhat');
require('dotenv/config');

const deployedAddress = '0xc4d2F43F9743fF3625E1E2e200E181c2b7F23f2b';

async function main() {
  let chainId = await hre.network.provider.send('eth_chainId');
  chainId = BigInt(chainId).toString();

  const provider = ethers.provider;

  // admin address must be different from deployer!!!, can't be same as deployer
  const privateKeyAdmin = process.env.PRIVATE_KEY_ADMIN;
  if (!privateKeyAdmin) {
    console.error('PRIVATE_KEY_ADMIN in .env required to deploy contract');
    return;
  }
  const admin = new ethers.Wallet(privateKeyAdmin, provider);

  console.log(`admin: ${admin.address}`);

  if (deployedAddress) {
    const contractFactory = (await ethers.getContractFactory('DutchAuction')).connect(admin);
    const c = await upgrades.upgradeProxy(deployedAddress, contractFactory);

    console.log(`contract upgraded at ${c.target}`);
  } else {
    const contractFactory = (await ethers.getContractFactory('DutchAuction')).connect(admin);
    const c = await upgrades.deployProxy(contractFactory);
    await c.waitForDeployment();

    console.log(`contract deployed to ${c.target}`);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
