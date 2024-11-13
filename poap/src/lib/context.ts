
import {writable} from 'svelte/store';

console.log("define data... as writeable")
export const data = writable({
	token: null
});

function setToken(token){
	console.log("setToken done for: ", JSON.stringify(token))
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