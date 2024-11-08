export type TokenMetadata = {
    image: string;
    name: string;
    attributes: {
        trait_type: string;
        value: string | number;
    }[];
};


export const isProd =
    !process.env.NEXT_PUBLIC_DEPLOYMENT_ENV &&
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

export const VIEWER_URL = isProd
    ? "https://viewer.tokenscript.org/"
    : "https://viewer-staging.tokenscript.org/";

export const OPENSEA_BASE = isProd ? "https://opensea.io/" : "https://testnets.opensea.io/"
export const OPENSEA_API = isProd ? "https://api.opensea.io" : "https://testnets-api.opensea.io"

export const CONFIG={
    84532:{  //base-sepolia
        CONTRACT_ADDRESS:'0x793124b7b430d4C795514D05B85d82519702423d',
        SCRIT_ID:'7738_5',
        OPENSEA_API:"https://testnets-api.opensea.io"
    },
    8453:{

        CONTRACT_ADDRESS:'0x..', //todo
        SCRIT_ID:'7738_5..',  //todo
        OPENSEA_API:"https://api.opensea.io"
    }
    //add more chain config
}

export function getChainConfig(chain: number): {
    CONTRACT_ADDRESS: string;
    SCRIT_ID: string;
} {
    const config = CONFIG[chain as keyof typeof CONFIG];
    if (!config) {
        throw new Error(`Chain ${chain} not supported`);
    }
    return config;
}
