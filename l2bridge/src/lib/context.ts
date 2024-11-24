import type { ITokenContextData } from '@tokenscript/card-sdk/dist/types';
import {writable} from 'svelte/store';

export const data = writable<{token:ITokenContextData|null}>({
	token: null
});

function setToken(token: ITokenContextData) {
	data.set({
		...data,
		token
	});

	// Do some other stuff
}

export default {
	data,
	setToken
};