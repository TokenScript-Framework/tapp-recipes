import { isProd } from "./utils";

export type TokenMetadata = {
  image: string;
  name: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
};

export const VIEWER_URL = isProd
  ? "https://viewer.tokenscript.org/"
  : "https://viewer-staging.tokenscript.org/";

  export const CONTRACT_ADDRESS='0x793124b7b430d4C795514D05B85d82519702423d'
  export const SCRIT_ID='7738_5'
