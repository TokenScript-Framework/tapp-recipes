<script lang="ts">
	import type { ITokenContextData } from '@tokenscript/card-sdk/dist/types';
	import context from './lib/context';
	import NotFound from './routes/NotFound.svelte';
	import TreasureBox from './routes/TreasureBox.svelte';
	import TLinkRequired from './routes/TLinkRequired.svelte';

	let token: ITokenContextData;
	let tsViewerType;

	let page: Page;

	tsViewerType = new URLSearchParams(document.location.hash.substring(1)).get('tsViewerType') ?? 'default'

	function routeChange() {
		const card: string = new URLSearchParams(document.location.hash.substring(1)).get('card') ?? '';
		page = tsViewerType.indexOf("tlink") === 0 ? TreasureBox : TLinkRequired;
		// page = TreasureBox;
	}

	if (tokenscript.tokens.data.currentInstance) {
		context.setToken(tokenscript.tokens.data.currentInstance);
	}

	tokenscript.tokens.dataChanged = async (oldTokens, updatedTokens, cardId) => {
		context.setToken(updatedTokens.currentInstance);
		token = updatedTokens.currentInstance;

		if (tokenscript.tokens.data.currentInstance) {
			context.setToken(tokenscript.tokens.data.currentInstance);
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
