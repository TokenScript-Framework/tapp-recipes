import { ethers, upgrades } from 'hardhat';
const hre = require('hardhat');
require('dotenv/config');

const deployedAddress = '0xf43DA4D5B258669a1d1c375687Fc96A32742a300';

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
    const contractFactory = (await ethers.getContractFactory('CareerExpV2')).connect(admin);
    const cxp = await upgrades.upgradeProxy(deployedAddress, contractFactory);

    console.log(`contract upgraded at ${cxp.target}`);
  } else {
    const contractFactory = (await ethers.getContractFactory('CareerExp')).connect(admin);
    const cxp = await upgrades.deployProxy(contractFactory, ['CareerExp', 'CXP']);
    await cxp.waitForDeployment();

    console.log(`contract deployed to ${cxp.target}`);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
