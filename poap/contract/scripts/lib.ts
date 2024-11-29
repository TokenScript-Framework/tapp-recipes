const {ethers} = require('hardhat');
require('dotenv').config();
// const { BigNumber } = require("ethers");

export async function hasPending(admin: any) {
  let addressToCheck = admin.address;

  const provider = ethers.provider;

  let nonce = await provider.getTransactionCount(addressToCheck);
  let pendingNonce = await provider.getTransactionCount(
    addressToCheck,
    'pending'
  );

  if (nonce !== pendingNonce) {
    console.log(
      'There are pending transactions. Are you sure you want to continue? Your TX can stuck if previous TXes had set low gas value.'
    );

    console.log('+++ getTransactionCount:', nonce);
    console.log('+++ pending tx Count:', pendingNonce);

    let pendingBlock = await provider.getBlock('pending', true);

    let prefetchedTransactions = pendingBlock?.prefetchedTransactions;
    let ownTxes = prefetchedTransactions?.filter((tx: any) => {
      return tx.from.toLowerCase() === addressToCheck.toLowerCase();
    });
    console.log({ownTxes});

    console.log('Stop script ... exit...');
    console.log('-----------------------');
    return true;
  } else {
    console.log('No pending transactions. Continue...');
    return false;
  }
}

export async function getFee(admin: any) {
  let params;
  try {
    let provider = admin.provider;
    const {chainId} = await ethers.provider.getNetwork();

    let pending;
    try {
      pending = await ethers.provider.getBlock('pending');
    } catch (e) {
      let lastlock = await ethers.provider.getBlockNumber();
      pending = await ethers.provider.getBlock(lastlock);
    }
    let baseFee = pending.baseFeePerGas;

    let maxGasPrice = 50 * 1000000000;

    let feePriority = 1000000000n;

    if ((baseFee && baseFee / 100n) > feePriority) {
      feePriority = baseFee / 100n;
    }

    console.log({baseFee});

    if (chainId == 137) {
      maxGasPrice = 200 * 1000000000;
      feePriority = 30n * 1000000000n;

      if (baseFee && (baseFee * 13n) / 100n >= feePriority) {
        feePriority = (baseFee * 13n) / 100n;
      }
    } else if (chainId == 80002) {
      maxGasPrice = 30 * 1_000_000_000;
      feePriority = 25n * 1_000_000_000n;
    }

    let nonce = await provider.getTransactionCount(admin.address);
    let pendingNonce = await provider.getTransactionCount(
      admin.address,
      'pending'
    );

    if (nonce !== pendingNonce) {
      console.log(
        'There are pending transactions. Are you sure you want to continue? Your TX can stuck if previous TXes had set low gas value.'
      );
      console.log('+++ getTransactionCount:', nonce);
      console.log('+++ pending tx Count:', pendingNonce);
      var entered = prompt(
        'Enter "yes" if you want to continue or press Enter to stop script: ',
        'no'
      );

      if (entered !== 'yes') {
        console.log('Stop script ... exit...');
        console.log('-----------------------');
        return;
      }
    }

    params = {
      maxPriorityFeePerGas: feePriority,
      maxFeePerGas: maxGasPrice,
      // maxFeePerGas: BigInt(maxGasPrice),
    };
    //  @ts-ignore
    provider.getFeeData = async () => params;
  } catch (e) {
    console.log('---------- Failed to prepare gas fee. exit. ---------');
    console.log(e);
    return false;
  }

  console.log('\n---------- Our TX data ---------');
  console.log(
    'Priority Fee: ',
    ethers.formatUnits(params.maxPriorityFeePerGas, 'gwei')
  );
  console.log(
    'Max Fee:      ',
    ethers.formatUnits(params.maxFeePerGas, 'gwei')
  );
  console.log('--------------------------------');

  return params;
}
