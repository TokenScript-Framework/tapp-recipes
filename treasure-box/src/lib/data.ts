import { JsonRpcProvider, Network } from 'ethers';
// import { Token } from './types';

const ensLookupCache: { [address: string]: string } = {};

export async function lookupEnsName(address: string) {
	if (ensLookupCache[address]) return ensLookupCache[address];

	const provider = new JsonRpcProvider(
		'https://eth-mainnet.g.alchemy.com/v2/2bJxn0VGXp9U5EOfA6CoMGU-rrd-BIIT',
		'mainnet',
		{
			staticNetwork: Network.from('mainnet')
		}
	); // TODO: get mainnet RPC URL via engine

	return await provider.lookupAddress(address) || "";
}



export async function signMessage(msg: string): Promise<string> {
	return new Promise((resolve, reject) => {
        // TODO fix
		web3.personal.sign({ data: msg }, function (error, value) {
			if (error != null) {
				reject(error);
			} else {
				resolve(value);
				console.log(value);
			}
		});
	});
}
