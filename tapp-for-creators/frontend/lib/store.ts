import { atomWithStorage } from "jotai/utils";
import { TwitterAccount } from "./types";
const TWITTER_ACCOUNT = "twitterAccount";

export const twitterAccountAtom = atomWithStorage<TwitterAccount | null>(
  TWITTER_ACCOUNT,
  null
);
