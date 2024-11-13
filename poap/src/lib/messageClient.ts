import { signMessage } from './data';
import { Token } from './types';

export class MessageClient {
	private static BASE_URL =
		import.meta.env.VITE_MESSAGING_API_BASE_URL ??
		// 'https://store-backend-stage.smartlayer.network/poap';
	// "http://127.0.0.1:3006/poap";
	tokenscript.env.API_BASE_URL

	private challengeExp = null;
	private challengeText = null;
	private challengeSig = null;

	constructor(private tokenContext: Token) {}

	private async request(url: string, method: 'get' | 'post', requestData?: any) {
		const headers: any = {
			'Content-type': 'application/json',
			Accept: 'application/json'
		};

		if (this.challengeSig)
			headers['X-SmartCat-Auth'] = this.challengeText + ':' + this.challengeSig;

		const res = await fetch(MessageClient.BASE_URL + url, {
			method,
			headers,
			body: requestData ? JSON.stringify(requestData) : undefined
		});

		let data: any;

		try {
			data = await res.json();
		} catch (e: any) {}

		if (res.status > 299 || res.status < 200) {
			if (res.status === 403) throw new Error('Authorisation failed');
			throw new Error(data?.message ?? res.statusText);
		}

		return data;
	}
}
