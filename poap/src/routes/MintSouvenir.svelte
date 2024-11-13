<script>
	import { onMount } from 'svelte';
	import { getSignatureToMint, getPoapStatus } from '../lib/api.ts';
	import { data } from '../lib/context';
	import ClickToCopy from '../components/ClickToCopy.svelte';

	let tokenId;
	let serviceSignature;
	let poapId = '';
	let secretPhrase = '';
	let minted;
	let poapProtected;
	let poapActive = false;
	let poapMessage;

	let ownerAddress;
	$: ownerAddress = $data.token?.ownerAddress;

	onMount(async () => {
		console.log('mint onMount');
		try {
			const url = new URLSearchParams(document.location.hash.substring(1));
			poapId = url.get('ext_poap') || '';
			secretPhrase = url.get('ext_secret') || '';
			poapId && handleSouvenirChange()
		} catch (error) {
			console.error('Failed to fetch data:', error);
		}
	});

	async function handleMint() {
		try {
			tokenscript.action.showLoader();
			// @ts-ignore
			const response = await getSignatureToMint(poapId, ownerAddress, secretPhrase);
			serviceSignature = response.signature;
			tokenId = response.tokenId;

			// Do donation
			tokenscript.action.setProps({
				mintTokenId: tokenId,
				poapId: poapId,
				signature: serviceSignature
			});
			let error = !(await tokenscript.action.executeTransaction());
			poapActive = false;
			poapMessage = 'Souveneer NFT minted succesfully!';
		} catch (error) {
			console.error('Error during minting process:', error);
			console.log(error);
			tokenscript.action.showMessageToast('error', 'Failed to prepare Minting', error.message);
		}

		tokenscript.action.hideLoader();
	}

	async function handleSouvenirChange() {
		let status = await getPoapStatus(poapId);
		poapProtected = status.protected;
		poapActive = status.ok;
		poapMessage = status.message;
		console.log({ status });
	}

	// TODO update link for "Make My Own"
</script>

<div class="min-h-screen bg-blue-600 flex flex-col items-center justify-center p-4">
	<div class="w-full max-w-md flex flex-col items-center gap-4">
		<!-- Pixel Art Frame -->
		<div
			class="w-32 h-32 md:w-40 md:h-40 rounded-full bg-blue-700 flex items-center justify-center p-1 relative"
		>
			<!-- Arcade Cabinet Pixel Art -->
			<div class="w-24 h-24 md:w-32 md:h-32 relative">
				<div class="absolute inset-0">
					<!-- Cabinet Frame -->
					<div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-green-400" />
					<div
						class="absolute top-2 left-1/2 -translate-x-1/2 w-3/4 h-3/4 border-4 border-green-400"
					>
						<!-- Screen -->
						<div
							class="absolute inset-1 border-4 border-pink-500 bg-gray-900 flex items-center justify-center"
						>
							<div class="w-3 h-3 bg-white rounded-full animate-pulse" />
						</div>
					</div>
					<!-- Cabinet Base -->
					<div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-1/4 bg-teal-300" />
				</div>
			</div>

			<!-- Sparkles -->
			<div class="absolute top-2 right-2 text-orange-300 text-xl">✦</div>
			<div class="absolute bottom-4 left-2 text-orange-300 text-sm">✦</div>
			<div class="absolute top-1/2 right-0 text-orange-300 text-sm">✦</div>
		</div>

		<h1 class="text-white text-2xl font-bold text-center mb-4">Mint a Sovenier NFT</h1>
		<input
			type="text"
			bind:value={poapId}
			on:input={handleSouvenirChange}
			placeholder="Enter Souvenir Factory ID"
			class="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
		/>

		<input
			type="password"
			bind:value={secretPhrase}
			placeholder="Enter secret phrase"
			class="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 {poapActive &&
			poapProtected
				? ''
				: 'disabled'}"
			disabled={!poapActive || !poapProtected}
		/>

		<button
			on:click={handleMint}
			class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors {poapActive
				? ''
				: 'disabled'}"
			disabled={!poapActive}
		>
			MINT
		</button>
		{#if poapMessage}
			<div class="text-green p-4">{poapMessage}</div>
		{/if}

		<div class="text-white/80 hover:text-white text-sm transition-colors">
			Make My Own (copy/paste to browser URL)
		</div>
		<ClickToCopy
			value={'https://viewer-staging.tokenscript.org/?chain=11155111&contract=0xcddcdc3231d062de953c94f59a335b1a4911ffdc&scriptId=7738_49#card=CreateSouvenir'}
		/>
	</div>
</div>

<style lang="scss">
	.disabled {
		opacity: 0.5;
		pointer-events: none;
	}
</style>
