export type TokenMetadata = {
    image: string;
    name: string;
    attributes: {
        trait_type: string;
        value: string | number;
    }[];
};


export const detectMainnet =(chainId:number)=>{
    const mainnetChainIds = [1, 137, 8453];
    return mainnetChainIds.includes(chainId);
}


export const CONFIG={
    84532:{  //base-sepolia
        CONTRACT_ADDRESS:'0x793124b7b430d4C795514D05B85d82519702423d',
        SCRIT_ID:'7738_5',
        CHAIN_ID:84532,
        OPENSEA_API:"https://testnets-api.opensea.io"
    },
    8453:{
        CONTRACT_ADDRESS:'0x793124b7b430d4C795514D05B85d82519702423d',  //todo
        SCRIT_ID:'7738_5',    //todo
        CHAIN_ID:84532, //todo
        OPENSEA_API:"https://api.opensea.io"
    },
    137:{
        CONTRACT_ADDRESS:'0x793124b7b430d4C795514D05B85d82519702423d',  //todo
        SCRIT_ID:'7738_5',    //todo
        CHAIN_ID:84532, //todo
        OPENSEA_API:"https://api.opensea.io"
    },
    1:{
        CONTRACT_ADDRESS:'0x793124b7b430d4C795514D05B85d82519702423d',  //todo
        SCRIT_ID:'7738_5',    //todo
        CHAIN_ID:84532, //todo
        OPENSEA_API:"https://api.opensea.io"
    },
    11155111:{
        CONTRACT_ADDRESS:'0x793124b7b430d4C795514D05B85d82519702423d',
        SCRIT_ID:'7738_5',
        CHAIN_ID:84532,
        OPENSEA_API:"https://testnets-api.opensea.io"
    }
    //add more chain config
}

export function getChainConfig(chain: number): {
    CONTRACT_ADDRESS: string;
    SCRIT_ID: string;
    CHAIN_ID:number;
} {
    const config = CONFIG[chain as keyof typeof CONFIG];
    if (!config) {
        throw new Error(`Chain ${chain} not supported`);
    }
    return config;
}

