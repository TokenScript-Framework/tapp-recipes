<script>
	import { onMount, onDestroy } from 'svelte';

	let particles = [];
	let intervalId;

	function generateParticles() {
		return Array.from({ length: 30 }, () => ({
			x: Math.random() * 100,
			y: Math.random() * 100,
			size: Math.random() * 6 + 2,
			speedX: (Math.random() - 0.5) * 2,
			speedY: (Math.random() - 0.5) * 2,
			opacity: Math.random() * 0.5 + 0.3
		}));
	}

	function animateParticles() {
		particles = particles.map((particle) => ({
			...particle,
			x: (particle.x + particle.speedX + 100) % 100,
			y: (particle.y + particle.speedY + 100) % 100,
			opacity: particle.opacity + (Math.random() - 0.5) * 0.1
		}));
	}

	onMount(() => {
		particles = generateParticles();
		intervalId = setInterval(animateParticles, 50);
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});
</script>

<div
	class="relative flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 p-8 overflow-hidden text-white"
>
	<div class="absolute top-0 left-0 w-full h-full bg-black/20 backdrop-blur-sm z-0" />

	{#each particles as particle, index (index)}
		<div
			class="absolute rounded-full bg-blue-400"
			style="left: {particle.x}%;
		     top: {particle.y}%;
		     width: {particle.size}px;
		     height: {particle.size}px;
		     opacity: {particle.opacity};
		     transition: all 0.5s linear;"
		/>
	{/each}

	<div class="absolute top-4 left-4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
	<div
		class="absolute bottom-4 right-4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"
	/>

	<slot />
</div>
