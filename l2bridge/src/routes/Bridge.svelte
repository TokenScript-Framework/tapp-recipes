<script lang="ts">
	import { onMount } from 'svelte';
	import { data } from '../lib/context';
	import context from '../lib/context';

	let amount;
	let amountAsBigInt;
	let userBalance;
	let bridgeAllowance;
	let poapMessage = '';
	let invalidAmount = false;
	let invalidAllowance = false;
	let anotherUserAddress = '';
	let invalidAnotherUserAddress = true;
	let bridgingError = {
		done: false,
		error: false
	};

	let token;
	context.data.subscribe((value) => {
		token = value.token;
	});

	$: {
		userBalance = token.userBalance;
		bridgeAllowance = token.bridgeAllowance;
		amountAsBigInt = BigInt(Math.floor((parseFloat(amount) || 0) * 10 ** 18));
		invalidAmount = amountAsBigInt === 0n || BigInt(userBalance) < amountAsBigInt;
		invalidAllowance = BigInt(bridgeAllowance) < amountAsBigInt;
	}

	function formatSln(val: string, decimals: number) {
		try {
			const bigIntVal = BigInt(val);
			const divisor = 10n ** 18n;
			const leftPart = bigIntVal / divisor;
			const rightPart = ((bigIntVal - leftPart * divisor) * 10n ** BigInt(decimals)) / 10n ** 18n;
			return Number(leftPart) + Number(rightPart) / 10 ** decimals;
		} catch (error) {
			return 'N/A';
		}
	}
	async function handleBridgeToOwnAddress(wallet: string = '') {
		try {
			bridgingError.done = false;

			tokenscript.action.showLoader();

			tokenscript.action.setProps({
				amount: amountAsBigInt,
				to: wallet
			});
			bridgingError.error = !(await tokenscript.action.executeTransaction(
				wallet ? 'startBridgeToUserAddress' : 'startBridge'
			));
			amount = '';
		} catch (error) {
			bridgingError.error = true;
			console.log(error);
			tokenscript.action.showMessageToast('error', 'Failed to Bridge', error.message);
		}
		bridgingError.done = true;

		tokenscript.action.hideLoader();
	}

	async function handleBridgeAllowance() {
		try {
			tokenscript.action.showLoader();

			tokenscript.action.setProps({
				amount: amountAsBigInt
			});

			let error = !(await tokenscript.action.executeTransaction('l1approve'));
			poapMessage = error ? 'TX error' : 'Bridge OK';
		} catch (error) {
			console.error('Error during approve process:');
			console.log(error);
			tokenscript.action.showMessageToast('error', 'Failed to prepare Minting', error.message);
		}

		tokenscript.action.hideLoader();
	}
</script>

<div class="min-h-screen bg-blue-600 flex flex-col items-center justify-center p-4">
	<div class="w-full max-w-md flex flex-col items-center gap-4">
		<h1 class="text-white text-2xl font-bold text-center mb-4">
			Set $SLN amount to bridge from BSC to opBNB
		</h1>
		<div class="text-white w-full">Your Wallet: {walletAddress}</div>
		<div class="text-white w-full">
			Your BSC $SLN balance: {formatSln(userBalance, 3)}
		</div>
		<div class="text-white w-full">
			BSC-opBNB Bridge $SLN allowance: {formatSln(bridgeAllowance, 3)}
		</div>
		<input
			type="text"
			bind:value={amount}
			on:input={() => {
				// invalidAmount = $data.token.userBalance < amount;
			}}
			placeholder="Enter Amount eg. '0.01' or '24.5'"
			class="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500
			{invalidAmount || invalidAllowance ? 'border-red-500' : ''}"
		/>

		{#if invalidAllowance}
			<button
				on:click={handleBridgeAllowance}
				class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
			>
				Allow Bridge to transfer $SLN
			</button>
		{/if}

		<button
			on:click={handleBridgeToOwnAddress}
			class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors {invalidAmount ||
			invalidAllowance
				? 'disabled'
				: ''}"
			disabled={invalidAmount || invalidAllowance}
		>
			Bridge to your wallet
		</button>

		<div class=" border-gray-300 text-white">--- or set receiver address ---</div>

		<input
			type="text"
			bind:value={anotherUserAddress}
			on:input={() => {
				invalidAnotherUserAddress = !/^0x[a-fA-F0-9]{40}$/.test(anotherUserAddress);
			}}
			placeholder="Fill wallet address to bridge to"
			class="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500
			{invalidAnotherUserAddress ? 'border-red-500' : ''}"
		/>

		<button
			on:click={() => {
				handleBridgeToOwnAddress(anotherUserAddress);
			}}
			class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors {invalidAmount ||
			invalidAllowance ||
			invalidAnotherUserAddress
				? 'disabled'
				: ''}"
			disabled={invalidAmount || invalidAllowance || invalidAnotherUserAddress}
		>
			Bridge to specified wallet
		</button>

		{#if bridgingError.done}
			{#if bridgingError.error}
				<div class="text-bold text-red-400 p-4">TX error</div>
			{:else}
				<div class="text-bold text-green-400 p-4">Bridge OK</div>
				<button
					on:click={() => {
						window.open(env.DEPOSITS + walletAddress + '?tab=deposit&p=1');
					}}
					class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
				>
					List of deposits (1 min delay)
				</button>
			{/if}
		{/if}
	</div>
</div>

<style lang="scss">
	.disabled {
		opacity: 0.5;
		pointer-events: none;
	}
</style>
