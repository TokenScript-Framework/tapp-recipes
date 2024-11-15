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

export async function spin(txHash: string, nonce: string, authToken: string) {
  const response = await axios.post(
    `${tokenscript.env.BACKEND_API_BASE_URL}/redbrick/spin`,
    {
      txHash,
      walletAddress,
      nonce,
      authToken,
    }
  );

  return response.data;
}

export async function getStlGameInfo() {
  const response = await axios.get(
    `${tokenscript.env.BACKEND_API_BASE_URL}/redbrick/spin-game-info`,
    {
      params: {
        wallet: walletAddress,
      },
    }
  );

  return response.data;
}
