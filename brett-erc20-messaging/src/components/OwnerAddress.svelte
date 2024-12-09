<script lang="ts">
	import { onMount } from 'svelte';
	import { lookupEnsName } from '../lib/data';
	import { TokenCardTypes } from '../lib/types';

	export let address: string;
	export let accountType = TokenCardTypes.Friends

	let ensName: string;

	onMount(async () => {
		const ensRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+eth$/
		if (ensRegex.test(address)){
			ensName = await lookupEnsName(address);
		}
	});
</script>

<small class="eth-address" title={address}>
	{#if accountType != TokenCardTypes.Group}
		<span class="fw600 avatar"><img alt="$BRETT" src="https://tokens.antopolbus.rv.ua/images/brett.png"></span>
	{/if}
	<span>{ensName ? `${ensName} (${address})` : address}</span>
</small>

<style>
	.eth-address {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		max-width: 100%;
		display: flex;
		align-items: center;
		font-size: 12px;
	}
	.avatar img {
		width: 30px;
		height: 30px;
		margin: 2px 5px;
	}
	.fw600 {
		font-weight: 600;
	}
</style>
