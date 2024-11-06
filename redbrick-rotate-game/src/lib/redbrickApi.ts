import axios from 'axios';

export async function getNonce() {
  const response = await axios.get(
    `${tokenscript.env.REDBRICK_API_BASE_URL}/partner-0xrotate/generate-nonce`
  );
  return response.data.nonce;
}
