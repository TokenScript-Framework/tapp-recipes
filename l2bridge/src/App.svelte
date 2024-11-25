<script lang="ts">
	import type { ITokenContextData } from '@tokenscript/card-sdk/dist/types';
	import context from './lib/context';
	import NotFound from './routes/NotFound.svelte';
	import Bridge from './routes/Bridge.svelte';
	import './styles.css';

	let token: ITokenContextData;
	let tsViewerType;

	let page: Page;

	page = Bridge;
	console.log("page = Bridge... 0")
	function routeChange() {
		const card: string = new URLSearchParams(document.location.hash.substring(1)).get('card') ?? '';
		console.log("page = Bridge")
		page = Bridge;
	}

	if (tokenscript.tokens.data.currentInstance) {
		context.setToken(tokenscript.tokens.data.currentInstance);
	}

	tokenscript.tokens.dataChanged = async (oldTokens, updatedTokens, cardId) => {
		context.setToken(updatedTokens.currentInstance);
		token = updatedTokens.currentInstance;

		if (token) {
			context.setToken(token);
			console.log({token})
		}
		routeChange();
	};
</script>

<svelte:window on:hashchange={routeChange} />

<div>
	<div id="token-container">
		<svelte:component this={page} />
	</div>
</div>
