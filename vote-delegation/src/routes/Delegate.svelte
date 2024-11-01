<script>
	import ParticleBackground from '../components/ParticleBackground.svelte';
	import { getConfig } from '../lib/config';

	const config = getConfig();

	tokenscript.action.setProps({ toAddress: config.walletAddress });

	let walletAddress = config.walletAddress;
	let description = config.description;

	function formatWalletAddress(address) {
		if (!address) return '';
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	}
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
	</div>
</ParticleBackground>
