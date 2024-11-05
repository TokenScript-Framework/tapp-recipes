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
