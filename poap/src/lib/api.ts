import type { ITokenContextData } from '@tokenscript/card-sdk/dist/types';

// export async function updateProfile(tokenId: string, profile: { name: string; image: string }) {
// 	const signature = (await tokenscript.personal.sign({ data: JSON.stringify(profile) })) as string;

// 	tokenscript.action.showLoader();

// 	await apiRequest(`${tokenId}/profile`, 'POST', { profile, signature });

// 	tokenscript.action.hideLoader();
// }

// export async function apiRequest(url: string, method: 'GET' | 'POST', requestData?: any) {
// 	const headers: any = {
// 		'Content-type': requestData ? 'application/json' : 'text/plain',
// 		Accept: 'application/json'
// 	};

// 	const res = await fetch(tokenscript.env.API_BASE_URL + url, {
// 		method,
// 		headers,
// 		cache: 'no-store',
// 		body: requestData ? JSON.stringify(requestData) : undefined
// 	} as RequestInit);

// 	let data: any;

// 	try {
// 		data = await res.json();
// 	} catch (e: any) {}

// 	if (res.status > 299 || res.status < 200) {
// 		throw new HttpError('HTTP Request failed:' + (data?.message ?? res.statusText), res.status);
// 	}

// 	return data;
// }

export class HttpError extends Error {
	constructor(message: string, public readonly statusCode: number) {
		super(message);
	}
}

export function getShareURL(token: ITokenContextData, numBeers: bigint) {
	const text = `I just bought ${numBeers > 1 ? numBeers.toString() : 'a'} beer${
		numBeers > 1 ? 's' : ''
	} for ${token.tokenInfo.name}! 🍻
Help keep ${token.tokenInfo.name} quenched by buying one too! #SmartLayer #Tapps
https://viewer.tokenscript.org/?chain=${chainID}&contract=${token.contractAddress}&tokenId=${
		token.tokenId
	}`;

	return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&related=SmartLayer`;
}
