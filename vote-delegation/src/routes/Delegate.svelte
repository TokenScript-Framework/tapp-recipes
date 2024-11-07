<script>
	import ParticleBackground from '../components/ParticleBackground.svelte';
	import { getConfig } from '../lib/config';
	import context from '../lib/context';

	const config = getConfig();
	let token;

	let walletAddress = config.walletAddress;
	let description = config.description;

	function formatWalletAddress(address) {
		if (!address) return '';
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	}

	context.data.subscribe(async (value) => {
		if (!value.token) return;

		token = value.token;
	});
</script>

<ParticleBackground>
	<div class="relative z-10 flex flex-col items-center gap-12 w-full">
		<div class="relative flex flex-col items-center gap-4">
			<div
				class="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-md"
				style="transition: transform 0.5s linear;"
			/>
			<div class="h-40 relative flex">
				<div class="w-40 h-40 border-4 border-white shadow-lg rounded-full">
					<img
						src={config.contractLogo}
						alt="contract logo"
						class="w-full h-full object-cover rounded-full"
					/>
				</div>
				<div class="-ml-10 w-40 h-40 border-4 border-white shadow-lg rounded-full z-50">
					<img
						src={config.avatar}
						alt="Second Avatar"
						class="w-full h-full object-cover rounded-full"
					/>
				</div>
			</div>
		</div>

		<div class="flex flex-col items-center gap-2 text-center">
			<p class="text-2xl font-bold text-blue-300">{formatWalletAddress(walletAddress)}</p>
			<p class="text-lg text-slate-300 max-w-sm">{description}</p>
		</div>

		<p class="text-xl font-medium text-indigo-300 italic text-center max-w-sm mt-4">
			"Delegate your voting power to me"
		</p>

		<div class="flex flex-col items-center gap-4 w-full">
			<button
				class="relative z-10 w-full bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 py-4 px-6 rounded-lg text-xl font-semibold shadow-md hover:shadow-lg hover:scale-105"
				on:click={() => {
					tokenscript.action.setProps({ toAddress: config.walletAddress });
					tokenscript.action.executeTransaction({
						contractAddress: token.contractAddress, // From ITokenContextData
						chainId: token.chainId
					});
				}}
			>
				Delegate
			</button>
		</div>

		<a
			href="https://vote-delegation.vercel.app/"
			target="_blank"
			class="fixed bottom-8 right-8 z-50 text-blue-300 hover:text-blue-400 transition-all duration-200 text-sm font-medium hover:underline"
		>
			Create yours →
		</a>
	</div>
</ParticleBackground>
