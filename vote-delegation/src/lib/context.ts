import { writable } from 'svelte/store';

const data = writable({
	token: null
});

function setToken(token) {
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
