import axios from 'axios';

export async function encryptJoinData(
  message: string,
  sig: string,
  rfc: string = ''
) {
  const payload = JSON.stringify({
    iat: Math.floor(Date.now() / 1000),
    msg: message,
    gid: tokenscript.env.REDBRICK_GAME_ID,
    sig,
    wdr: walletAddress,
    rfc,
    exp: Math.floor(Date.now() / 1000) + 60, // don't change this, RB require it to be 1 minute expiration
  });

  const response = await axios.post(
    `${tokenscript.env.BACKEND_API_BASE_URL}/redbrick/encrypt`,
    { payload }
  );
  return response.data.data;
}

export async function encryptSpinData() {
  const payload = JSON.stringify({
    iat: Math.floor(Date.now() / 1000),
    wdr: walletAddress,
    exp: Math.floor(Date.now() / 1000) + 60, // don't change this, RB require it to be 1 minute expiration
  });

  const response = await axios.post(
    `${tokenscript.env.BACKEND_API_BASE_URL}/redbrick/encrypt`,
    { payload }
  );
  return response.data.data;
}

export function getSignMessage(nonce: string) {
  return `
      Welcome to REDBRICK!
    
      Signing is the only way we can truly know
      that you are the owner of the wallet
      you are connecting.
      Signing is a safe, gas-less transaction
      that does not in any way
      give REDBRICK permission to perform
      any transactions with your wallet.
    
      Wallet address:\n${walletAddress}
      
      Chain ID:\n${chainID}
      Name:\nMetaMask
      Nonce:\n${nonce}`;
}
