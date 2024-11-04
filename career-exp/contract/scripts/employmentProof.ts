import { ethers } from 'hardhat';
const hre = require('hardhat');
require('dotenv/config');

async function main() {
  const provider = ethers.provider;

  // admin address must be different from deployer!!!, can't be same as deployer
  const privateKeyAdmin = process.env.PRIVATE_KEY_ADMIN;
  if (!privateKeyAdmin) {
    console.error('PRIVATE_KEY_ADMIN in .env required to deploy contract');
    return;
  }
  const signer = new ethers.Wallet(privateKeyAdmin, provider);

  const contractAddress = '0xf43DA4D5B258669a1d1c375687Fc96A32742a300';
  const employeeId = '23';
  const title = 'CFO';
  // const titles = [
  //   'Chief Inspiration Officer',
  //   'Culture Champion',
  //   'Innovation Evangelist',
  //   'Happiness Curator',
  //   'Collaboration Catalyst',
  //   'Wellness Advocate',
  //   'Visionary Strategist',
  //   'Customer Delight Specialist',
  //   'Growth Guru',
  //   'Sustainability Steward',
  // ];
  const endInSec = Math.floor(Date.now() / 1000);
  const startInSec = endInSec - 60 * 60 * 24 * 365 * 2;

  // titles.forEach(async (title, i) => {
  const abiCoder = new ethers.AbiCoder();
  // const employeeId = `${4 + i}`
  const encoded = await abiCoder.encode(
    ['address', 'uint', 'string', 'string', 'uint', 'uint'],
    [contractAddress, 84532, employeeId, title, startInSec, endInSec],
  );
  const signature = await signer.signMessage(ethers.getBytes(ethers.keccak256(encoded)));

  console.log(
    await abiCoder.encode(
      ['string', 'string', 'uint', 'uint', 'bytes'],
      [employeeId, title, startInSec, endInSec, signature],
    ),
  );

  // })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
