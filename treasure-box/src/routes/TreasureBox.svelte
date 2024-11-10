<script lang="ts">
	import context from '../lib/context';
	import { MessageClient } from '../lib/messageClient';
	import Loader from '../components/Loader.svelte';
	import { onMount } from 'svelte';

	import { showLoader, notify } from '../lib/storage';

	let token;
	let loading = false;
	let shared = false;
	let mainOpened = false;
	let mainRewarded = false;
	let bonusOpened = false;
	let bonusRewarded = false;
	let client = new MessageClient();

	let twitterId = '';
	let twitterIdFromApi;

	const twitterRegEx = /^@([A-Za-z0-9_]{1,15})$/;

	tokenscript.tlink &&
		tokenscript.tlink
			.request({ method: 'getTlinkContext', payload: [] })
			.then((data) => {
				if (data?.handle) {
					twitterId = data.handle;
					twitterIdFromApi = data.handle;
					openBox(0);
				}
			})
			.catch((e) => {
				console.log('getTlinkContext error');
				console.log(e);
			});

	function handleBoxOpenResult(boxes) {
		if (!boxes?.length) {
			mainOpened = false;
			bonusOpened = false;
			return;
		}
		mainOpened = true;
		bonusOpened = boxes?.length > 1;

		mainRewarded = boxes[0].amount;
		bonusRewarded = boxes[1]?.amount;
	}

	async function openBox(boxId: number) {
		
		if (!(twitterIdFromApi || twitterId)){
			return
		}
		try {
			const result = await client.openBox(twitterIdFromApi || twitterId, boxId);
			console.log({ result });
			handleBoxOpenResult(result.boxes);
		} catch (e) {
			console.log(e);
		}
	}

	onMount(() => {
		openBox(0);
	});
</script>

<div class="">
	<div class="treasure-border" style="color:white;">
		<!-- <div class="text-center title">Treasure Boxes Game</div> -->
		<div style="" class="flex-center row">
			<div class="col-6">
				<div class="box-wrap">
					<img
						class="box locked_box"
						class:fade-out={mainOpened}
						src="https://tokens.antopolbus.rv.ua/images/locked_box5.png"
						alt=""
					/>
					<img
						class="box rewarded_box opacity0"
						class:fade-in={mainOpened && mainRewarded}
						src="https://tokens.antopolbus.rv.ua/images/rewarded_box5.png"
						alt=""
					/>
					<img
						class="box rewarded_box opacity0"
						class:fade-in={mainOpened && !mainRewarded}
						src="https://tokens.antopolbus.rv.ua/images/empty_box5.png"
						alt=""
					/>
				</div>
			</div>

			<div class="col-6">
				<div class="box-wrap">
					<img
						class="box locked_box"
						class:fade-out={bonusOpened}
						src="https://tokens.antopolbus.rv.ua/images/locked_box5.png"
						alt=""
					/>
					<img
						class="box rewarded_box opacity0"
						class:fade-in={bonusOpened && bonusRewarded}
						src="https://tokens.antopolbus.rv.ua/images/rewarded_box5.png"
						alt=""
					/>
					<img
						class="box rewarded_box opacity0"
						class:fade-in={bonusOpened && !bonusRewarded}
						src="https://tokens.antopolbus.rv.ua/images/empty_box5.png"
						alt=""
					/>
				</div>
			</div>
		</div>

		<h3 style="font-size:12px">
			Please enter your twitter ID, this twitter ID owner will get Treasure reward. Connect Wallet,
			which will receive reward for this Twitter ID
		</h3>
		<input
			type="text"
			id="twitter-input"
			class:disabled={twitterIdFromApi}
			bind:value={twitterId}
			disabled={twitterIdFromApi}
			placeholder="Twitter ID"
		/>
		<h4>
			{#if !twitterIdFromApi}
				<span>Please enter your twitter name and you</span>
			{:else}
				<span>You</span>
			{/if}
			{#if mainOpened && bonusOpened}
				can open one box to have a chance to find treasure.
			{/if}
			You can Share this TAPP to your friends and they will get a chanse to find treasure Treasure Boxes!
			Lot of treasures exists in hidden boxes!
		</h4>

		{#if mainRewarded || bonusRewarded}
			<p class="rewarded text-center">
				You got a Treasure! Congratulations!<br />Treasure saved in DB for your twitter ID
				<br />Please check our posts to get a way to receive reward to your wallet.
				<br />Be ready to login with this tweeter ID to get reward.
				<br />Well done!
				{#if !bonusOpened && !shared}
					<br />And you still have a chance to open Bonus Box! Click and Tweet!
				{/if}
			</p>
		{/if}

		{#if mainOpened && !mainRewarded && bonusOpened && !bonusRewarded}
			<p>
				What a bad luck! Empty Treasure Box! Looks like someone already got the treasure from this
				box. You can be lucky next time or your friend can be try to find the treasure. Just share
				this tweet URI with your friend.
			</p>
		{/if}
		<button
			class="btn-gradient inactive"
			class:active={twitterId.length && !loading}
			on:click={() => {
				openBox(1);
			}}
			disabled={loading || !twitterId.length}
		>
			Open Box
		</button>
		<div id="invite-friend" />

		<button
			class="btn-gradient"
			on:click={() => {
				shared = true;
				const tappUri =
					'https://viewer-staging.tokenscript.org/?chain=11155111&contract=0x675FCB1707fda7F60891f0709152942F5676222C&tokenId=0&scriptId=7738_47#card=OpenTreasureBox';
				const message =
					'Please install Tlink browser extension to get a chance to Find Treasures up to $100!';
				const shareUrl = 'https://twitter.com/intent/tweet';

				const twitterUrl = `${shareUrl}?text=${encodeURIComponent(
					message
				)}&url=${encodeURIComponent(tappUri)}`;

				window.open(twitterUrl, '_blank');
			}}
		>
			Share on Twitter
		</button>

		{#if shared}
			<button
				class="btn-gradient inactive"
				class:active={twitterId.length && !loading}
				on:click={() => {
					openBox(2);
				}}
				disabled={loading || !twitterId.length}
			>
				Open Extra Box
			</button>
		{/if}
	</div>
	<Loader show={loading} />
</div>

<style lang="scss">
	#twitter-input {
		width: 100%;
		padding: 4px;
		font-size: 1.5em;
	}
	.title {
		font-size: 2em;
		color: #d4af37; /* Gold color */
		text-shadow: 2px 2px 0 #8b4513, /* Dark outline for depth */ 3px 3px 5px rgba(0, 0, 0, 0.7); /* Shadow for 3D effect */
		background-color: #fdf5e6;
		padding: 10px 20px;
		border: 3px solid #d4af37;
		border-radius: 5px;
		display: inline-block;
		width: 100%;
		//   margin: 20px 0;
		box-shadow: 0 0 15px rgba(0, 0, 0, 0.5); /* Additional shadow for depth */
	}
	.inactive:not(.active) {
		pointer-events: none;
		opacity: 0.5;
	}
	.opacity0 {
		opacity: 0;
	}
	.row {
		display: flex;
		width: 100%;
		.col-6 {
			width: 50%;
		}
	}
	.box-wrap {
		position: relative;
		&:before {
			content: '';
			display: block;
			padding-top: 120%;
		}
		&:after {
			content: '';
			display: block;
			clear: both;
		}
	}
	.box {
		position: absolute;
		width: 80%;
		left: 10%;
		top: 10%;
	}
	.rewarded {
		color: green;
	}
	.text-center {
		text-align: center;
	}
	.btn-gradient {
		margin-top: 10px;
		background: linear-gradient(234.79deg, #914e2d 37.73%, #eb774c 118.69%);
		background-size: 200% 200%;
		background-position: 0% 50%;
		padding: 10px;
		font-size: 18px;
		font-weight: 600;
		color: #fff;
		text-align: center;
		border-radius: 4px;
		cursor: pointer;
		width: 100%;
		border: none;
		display: block;
		text-decoration: none;
		transition: all 0.5s;
		&:hover {
			background-position: 100% 50%;
		}
	}
	.flex-center {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.active {
		background-color: #ff0000;
	}
	.fade-in {
		opacity: 1;
		transition: opacity 2s ease-in-out;
	}
	.fade-out {
		opacity: 0;
		transition: opacity 2s ease-in-out;
	}
	.treasure-border {
		border: 4px solid #000; /* Gold color */
		border-radius: 10px;
		padding: 20px;
		// background-color: #fdf5e6; /* A light parchment-like color */
		background-color: #080b57; /* A light parchment-like color */
		// box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); /* Shadow for depth */
		box-shadow: 0 0 10px rgba(0, 0, 0, 1); /* Shadow for depth */
		// background-image: linear-gradient(135deg, rgba(255, 235, 205, 0.4) 25%, transparent 25%),
		// 	linear-gradient(225deg, rgba(255, 235, 205, 0.4) 25%, transparent 25%),
		// 	linear-gradient(45deg, rgba(255, 235, 205, 0.4) 25%, transparent 25%),
		// 	linear-gradient(315deg, rgba(255, 235, 205, 0.4) 25%, transparent 25%);
		background-size: 20px 20px;
		background-position: 0 0, 10px 0, 10px -10px, 0px 10px; /* Rough texture */
		min-height: 97vh;
		color: #fff;
	}

	.treasure-border::before {
		content: '';
		display: block;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		//   border: 2px dashed #8b4513; /* Wood-like dashed outline */
		border-radius: 10px;
		pointer-events: none; /* Ensures this pseudo-element doesn’t interfere with interactions */
		box-sizing: border-box;
		z-index: -1;
	}
</style>
