<script>
	import ParticleBackground from '../components/ParticleBackground.svelte';
	import { getConfig } from '../lib/config';
	import { onMount, onDestroy } from 'svelte';

	const config = getConfig();
	let walletAddress = config.walletAddress;
	let description = config.description;

	function formatWalletAddress(address) {
		if (!address) return '';
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	}
</script>

<ParticleBackground>
	<div class="relative z-10 flex flex-col items-center gap-12 w-full">
		<p class="text-xl font-medium text-indigo-300 italic text-center max-w-sm mt-4">
			"Delegate your voting power to me"
		</p>

		<div class="text-center mt-8">
			<p class="text-slate-300 mb-2">Want to create your own delegate profile?</p>
			<a
				on:click={() => {
					window.parent.open('https://vote-delegation.vercel.app/', '_blank');
				}}
				class="text-blue-400 hover:text-blue-300 transition-colors duration-200 underline"
			>
				Get started here →
			</a>
		</div>
	</div>
</ParticleBackground>
