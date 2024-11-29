<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

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
	let souvenirImageUrl;
	let souvenirName;

	let remaining = 0;
	let total = 0;

	let days = 0,
		hours = 0,
		minutes = 0,
		seconds = 0;
	let timerInterval;
	let targetTime = new Date();

	function updateTimer() {
		const now = new Date();

		const diff = (targetTime instanceof Date && !isNaN(targetTime) ? targetTime : new Date()) - now;
		if (diff <= 0) {
			days = hours = minutes = seconds = 0;
			clearInterval(timerInterval);
			if (targetTime){
				poapActive = false;
			}
			return;
		}

		days = Math.floor(diff / (1000 * 60 * 60 * 24));
		hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		seconds = Math.floor((diff % (1000 * 60)) / 1000);
	}

	onDestroy(() => {
		clearInterval(timerInterval);
	});

	onMount(async () => {
		updateTimer();
		timerInterval = setInterval(updateTimer, 1000);

		try {
			const url = new URLSearchParams(document.location.hash.substring(1));
			poapId = url.get('ext_poap') || '';
			secretPhrase = url.get('ext_secret') || '';
			poapId && handleSouvenirChange();
		} catch (error) {
			console.error('Failed to fetch data:', error);
		}
	});

	async function handleMint() {
		try {
			tokenscript.action.showLoader();
			// @ts-ignore
			const response = await getSignatureToMint(poapId, secretPhrase);
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
			poapMessage = error ? 'Mint error' : 'Souveneer NFT minted succesfully!';
			if (!error) {
				remaining--;
			}
		} catch (error) {
			console.error('Error during minting process:', error);
			console.log(error);
			tokenscript.action.showMessageToast('error', 'Failed to prepare Minting', error.message);
		}

		tokenscript.action.hideLoader();
	}

	async function handleSouvenirChange() {
		console.log('...handleSouvenirChange');
		try {
			let status = await getPoapStatus(poapId);
			console.log({ status });
			poapProtected = status.protected;
			poapActive = status.ok;
			poapMessage = status.message;
			souvenirImageUrl = status.imageUrl;
			souvenirName = status.name;
			targetTime = new Date(status.endTime);
			console.log({ targetTime, endTime: status.endTime });
			total = status.total || 0;
			remaining = total - (status.minted || 0);
		} catch (error) {
			console.error('Error during minting process:', error);
			console.log(error);
			tokenscript.action.showMessageToast('error', 'Failed to prepare Minting', error.message);
		}
	}

	// TODO update link for "Make My Own"
</script>

<div
	class="min-h-screen bg-black border-solid border-blue-600 border-2 flex flex-col items-center justify-center rounded-lg p-4"
>
	{#if !poapId}
		<div
			class="w-full flex flex-col items-center gap-4 bg-blue-600 p-4"
			style="min-height: calc(100vh - 70px)"
		>
			<h1 class="text-white text-4xl font-semibold text-center w-full">
				Sorry, Souvenir ID is not found, please try to use correct Tlink.
			</h1>
		</div>
	{:else}
		<div class="w-full flex flex-col items-center gap-1 bg-blue-600 p-4">
			<h1 class="text-white text-2xl font-300">Mint a Sovenier NFT</h1>
			{#if souvenirImageUrl}
				<div
					class="w-[300px] h-[300px] mt-4 mx-auto bg-contain bg-center bg-no-repeat rounded-full border-2 border-gray-200"
					style={`background-image: url(${souvenirImageUrl})`}
				/>
			{:else}
				<div class="relative mt-4">
					<div class="w-64 h-64 mx-auto bg-[#4338CA] rounded-full flex items-center justify-center">
						<!-- Pixel art arcade machine would go here -->
						<div class="w-40 h-40 relative">
							<!-- This is a simplified representation of the arcade machine -->
							<div class="absolute inset-0 bg-[#1F2937] rounded-lg transform -rotate-3">
								<div class="h-2/3 border-4 border-[#10B981] m-2">
									<div class="h-full border-2 border-[#EC4899] m-1">
										<div class="h-full bg-black m-1" />
									</div>
								</div>
								<div class="flex justify-center mt-2 space-x-2">
									<div class="w-3 h-3 rounded-full bg-[#EC4899]" />
									<div class="w-3 h-3 rounded-full bg-[#EC4899]" />
								</div>
							</div>
						</div>
						<!-- Decorative crosses -->
						<div class="absolute top-4 right-4 text-white text-xl">+</div>
						<div class="absolute bottom-4 left-4 text-white text-xl">+</div>
						<div class="absolute top-1/2 right-4 text-white text-xl">+</div>
					</div>
				</div>
			{/if}
			{#if souvenirName}
				<h2 class="text-white text-3xl font-bold tracking-wider mt-4">{souvenirName}</h2>
			{/if}

			<input
				type="password"
				bind:value={secretPhrase}
				placeholder={poapProtected
					? 'Enter secret phrase'
					: 'No need for password for this souvenir'}
				class="w-full px-4 py-2 mt-4 rounded-lg bg-white border-2 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 {poapActive &&
				poapProtected
					? ''
					: 'disabled'}"
				disabled={!poapActive || !poapProtected}
			/>
			<div class="text-white text-sm">
				Remaining: {remaining}/{total}
			</div>

			<!-- Timer -->
			<div class="text-white text-sm">
				Time Left: {days ? days + 'd ' : ''}
				<span class="inline-block min-w-[60px]">
					{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds
					.toString()
					.padStart(2, '0')}
				</span>
			</div>
		</div>

		<button
			on:click={handleMint}
			class="min-w-[150px] bg-blue-500 mt-4 rounded-full hover:bg-blue-600 text-white font-bold py-3 px-6 transition-colors {!poapActive ||
			(poapProtected && !secretPhrase)
				? 'disabled'
				: ''}"
			disabled={!poapActive || (poapProtected && !secretPhrase)}
		>
			MINT
		</button>

		{#if poapMessage}
			<div class="text-bold text-green-400 p-2">{poapMessage}</div>
		{/if}

		<div class="text-white/80 hover:text-white text-sm transition-colors mt-2">
			<a
				target="_blank"
				href="https://viewer-staging.tokenscript.org/?chain=11155111&contract=0xcddcdc3231d062de953c94f59a335b1a4911ffdc&scriptId=7738_49#card=CreateSouvenir"
				>Make My Own</a
			>
		</div>
	{/if}
</div>

<style lang="scss">
	.disabled {
		opacity: 0.2;
		pointer-events: none;
	}
</style>
