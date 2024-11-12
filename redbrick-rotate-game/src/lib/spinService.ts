import { encryptJoinData, encryptSpinData } from './backendApi';
import { chain, publicClient, walletClient } from './provider';
import {
  getNonce,
  getSignMessage,
  getSpinSignature,
  join,
} from './redbrickApi';

export async function joinGame() {
  const nonce = await getNonce();
  const message = getSignMessage(nonce);
  const sig = await tokenscript.personal.sign({ data: message });
  const joinData = await encryptJoinData(message, sig as string);

  return await join(joinData);
}

export async function spinSignature(authToken: string) {
  const spinData = await encryptSpinData();

  return await getSpinSignature(spinData, authToken);
}

export async function buySpin(spinSignatureResponse: {
  data: { contractAddress: `0x${string}`; data: `0x${string}`; price: string };
}) {
  await walletClient.addChain({ chain });
  await walletClient.switchChain({ id: chain.id });
  const hash = await walletClient.sendTransaction({
    to: spinSignatureResponse.data.contractAddress,
    data: spinSignatureResponse.data.data,
    value: BigInt(spinSignatureResponse.data.price),
    gas: BigInt(40_000),
  });
  await publicClient.waitForTransactionReceipt({ hash });

  return hash;
}
