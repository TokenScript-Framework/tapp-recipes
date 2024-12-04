import {ethers, network, upgrades} from 'hardhat';
// import { getFee } from './lib';
import {getFee, hasPending} from './lib';
import hre from 'hardhat';
require('dotenv/config');
import {Souvenir} from '../typechain-types';

let NFT_CONTRACT_ADDRESS = '';

async function main() {
  const [owner, addr1] = await ethers.getSigners();

  let privateKey = process.env.PRIVATE_KEY_PROD;
  let deployer = new ethers.Wallet(privateKey || '', ethers.provider);

  let chainId = await hre.network.provider.send('eth_chainId');
  chainId = BigInt(chainId).toString();

  if (chainId === '31337') {
    const [nodeSigner] = await ethers.getSigners();

    const tx = await nodeSigner.sendTransaction({
      to: deployer.address,
      value: 10n ** 18n, // 1 ETH
      gasLimit: 100_000,
    });
    await tx.wait();
  } else if (
    chainId === '1001' ||
    chainId === '11155111' ||
    chainId === '1687' ||
    chainId === '80002'
  ) {
    // testnets
    deployer = new ethers.Wallet(
      process.env.PRIVATE_KEY_HU || '',
      ethers.provider
    );
  }

  switch (chainId) {
    case '11155111':
      NFT_CONTRACT_ADDRESS = '';
      break;
    case '31337':
      break;
  }

  if (!privateKey) {
    console.error('PRIVATE_KEY in .env required to deploy contract');
    return;
  }

  console.log(`Deployer: "${deployer.address}"`);
  console.log(
    `Deployer balance "${ethers.formatEther(
      await ethers.provider.getBalance(deployer.address)
    )}"`
  );

  if (await hasPending(deployer)) {
    console.log('Has pending transactions. Stop script ... exit...');
    return;
  }

  if (chainId === '137' || chainId === '80002') {
    // polygon need defined fee
    const fee = await getFee(deployer);
    if (!fee) {
      console.log('Fee generation error. Stop script ... exit...');
      return;
    }
    console.log({fee});
  }
  // return;

  const Souvenir_ = (await ethers.getContractFactory('Souvenir')).connect(deployer);

  // return;
  let nft;
  if (!NFT_CONTRACT_ADDRESS) {
    nft = (await upgrades.deployProxy(Souvenir_)) as unknown as Souvenir;
    await nft.waitForDeployment();
    console.log(`NFT contract deployed to ${nft.target}`);

    if (
      chainId === '1001' ||
      chainId === '11155111' ||
      chainId === '1687' ||
      chainId === '80002'
    ) {
      let tx
      // testnets
      // let tx = await nft.connect(deployer).setMintTimeRange(1n, Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30);
      // await tx.wait()
      // console.log(`Mint range set to 30days`);
      tx = await nft.connect(deployer).setMinterRole(deployer.address);
      await tx.wait()
      console.log(`Minter role added to: ${deployer.address}`);
    }
    
  } else {
    nft = await Souvenir_.attach(NFT_CONTRACT_ADDRESS);
    console.log(`NFT contract attached to ${nft.target}`);
  }

  console.log(
    `Deployer balance "${ethers.formatEther(
      await ethers.provider.getBalance(deployer.address)
    )}"`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
