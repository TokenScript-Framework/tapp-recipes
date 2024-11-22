export const NEXT_PUBLIC_BACKEND_BASE =
  process.env.NEXT_PUBLIC_BACKEND_BASE || "http://127.0.0.1:3106/";

export const TOKEN_PARAM = "twitter_access_token";

export const ERROR_PARAM = "twitter_error";

export const ERROR_LIST: { [key: string]: string } = {
  1003: "The user rejected the authorization request.",
  1004: "There is no accesstoken.",
};

export const TWITTER_ROOT = "https://x.com";
