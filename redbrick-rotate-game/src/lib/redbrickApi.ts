import axios from 'axios';
import { getWalletAddress } from './provider';

export async function getNonce() {
  const response = await axios.get(
    `${tokenscript.env.REDBRICK_API_BASE_URL}/partner-0xrotate/generate-nonce`
  );
  return response.data.nonce;
}

export async function join(data: string) {
  const response = await axios.post(
    `${tokenscript.env.REDBRICK_API_BASE_URL}/partner-0xrotate/join`,
    { data }
  );
  return response.data;
}

export async function getSpinSignature(data: string, authToken: string) {
  const response = await axios.post(
    `${tokenscript.env.REDBRICK_API_BASE_URL}/partner-0xrotate/spin-signature`,
    { data },
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  return response.data;
}

export async function getGameStatus() {
  const response = await axios.get(
    `${tokenscript.env.REDBRICK_API_BASE_URL}/partner-0xrotate/status`
  );
  return response.data;
}

export async function getRemainingPool(authToken: string) {
  const response = await axios.get(
    `${tokenscript.env.REDBRICK_API_BASE_URL}/partner-0xrotate/remaining-pool`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );
  return response.data.data.spin;
}

export async function getUserGameInfo(authToken: string) {
  const response = await axios.get(
    `${tokenscript.env.REDBRICK_API_BASE_URL}/partner-0xrotate/info`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );
  return response.data;
}

export async function getMissionStatus(authToken: string) {
  const response = await axios.get(
    `${tokenscript.env.REDBRICK_API_BASE_URL}/partner-0xrotate/missions/status`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );
  return response.data;
}

export async function getRewards(authToken: string) {
  const response = await axios.get(
    `${tokenscript.env.REDBRICK_API_BASE_URL}/partner-0xrotate/rewards`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );
  return response.data;
}

export async function createMission(authToken: string, type: string) {
  const response = await axios.post(
    `${tokenscript.env.REDBRICK_API_BASE_URL}/partner-0xrotate/missions`,
    { type },
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  return response.data;
}

export async function getDiscordStatus(authToken: string) {
  const response = await axios.get(
    `${tokenscript.env.REDBRICK_API_BASE_URL}/partner-0xrotate/discord/status`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );
  return response.data;
}

export async function joinDiscord(authToken: string) {
  const response = await axios.post(
    `${tokenscript.env.REDBRICK_API_BASE_URL}/partner-0xrotate/discord/join`,
    {},
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  return response.data;
}

export async function getSignMessage(nonce: string) {
  return `
      Welcome to REDBRICK!
    
      Signing is the only way we can truly know
      that you are the owner of the wallet
      you are connecting.
      Signing is a safe, gas-less transaction
      that does not in any way
      give REDBRICK permission to perform
      any transactions with your wallet.
    
      Wallet address:\n${await getWalletAddress()}
      
      Chain ID:\n${chainID}
      Name:\nMetaMask
      Nonce:\n${nonce}`;
}
