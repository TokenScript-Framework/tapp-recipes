import type { ITokenContextData } from '@tokenscript/card-sdk/dist/types';

export type PoapProfile = {
	name: string;
	description: string;
	imageUrl: string;
	startDate: string;
	endDate: string;
	attendees: number;
	mintCondition: string;
	secret: string;
};

export async function getTlink(poap: PoapProfile, file: any) {
	const msgToSign = JSON.stringify({
		name: poap.name,
		description: poap.description,
		startDate: poap.startDate,
		endDate: poap.endDate,
		attendees: poap.attendees.toString(),
		mintCondition: poap.mintCondition
	});

	const signature = (await tokenscript.personal.sign({ data: msgToSign })) as string;

	// TODO fix coinBase smartwalletSignature
	console.log({ msgToSign, signature });

	tokenscript.action.showLoader();

	const formData = new FormData();
	formData.append('file', file);
	formData.append('name', poap.name);
	formData.append('description', poap.description);
	formData.append('imageUrl', poap.imageUrl);
	formData.append('startDate', poap.startDate);
	formData.append('endDate', poap.endDate);
	formData.append('attendees', poap.attendees.toString());
	formData.append('mintCondition', poap.mintCondition);
	formData.append('secret', poap.secret);
	formData.append('signature', signature);
	
	// const res = await fetch(tokenscript.env.API_BASE_URL + `/create`, {
	const res = await fetch(tokenscript.env.API_BASE_URL + `/create`, {
		method: 'POST',
		body: formData
	});

	if (!res.ok) {
		throw new Error('Network response was not ok');
	  }
	  const data = await res.json();
	tokenscript.action.hideLoader();
	// TODO validate responce

	return data["tlinkUrl"] || "";
}

export async function getSignatureToMint(poapId: bigint, secret: string = ""){
	const msgToSign = JSON.stringify({
		poapId: poapId,
		address: walletAddress.toLowerCase(),
		secret,
	});

	const signature = (await tokenscript.personal.sign({ data: msgToSign })) as string;

	return await apiRequest(`/mint/${poapId}`, "POST", {
		secret,
		address: walletAddress.toLowerCase(),
		signature,
	});
}

export async function getPoapStatus(poapId: bigint){
	return await apiRequest(`/validate/${poapId}`, "GET");
}

export async function apiRequest(url: string, method: 'GET' | 'POST', requestData?: any) {
	const headers: any = {
		'Content-type': requestData ? 'application/json' : 'text/plain',
		Accept: 'application/json'
	};

	const res = await fetch(tokenscript.env.API_BASE_URL + url, {
		method,
		headers,
		cache: 'no-store',
		body: requestData ? JSON.stringify(requestData) : undefined
	} as RequestInit);

	let data: any;

	try {
		data = await res.json();
	} catch (e: any) {}

	if (res.status > 299 || res.status < 200) {
		throw new HttpError('HTTP Request failed:' + (data?.error ?? res.statusText), res.status);
	}

	return data;
}

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
