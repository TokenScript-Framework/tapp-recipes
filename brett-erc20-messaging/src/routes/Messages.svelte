<script lang="ts">
	import context from '../lib/context';
	import { showLoader } from '../lib/storage';
	import TokenCard from '../components/TokenCard.svelte';
	import MessagePopup from '../components/MessagePopup.svelte';
	import { ThreadItem, Token, TokenCardTypes } from '../lib/types';
	import { signMessage } from '../lib/data';
	import { MESSAGING_GENERATOR, MESSAGING_PRIME } from '../lib/constants';
	import { DH } from '../lib/dh';
	import { hexStringToUint8 } from '../lib/helpers';
	import { onDestroy } from 'svelte';
	import { ethers } from 'ethers';

	let token: Token;
	let contract: any; // Replace `any` with the correct type if available

	let threadsList: ThreadItem[] = [];
	let selectedFriendAddress: string = '';
	let reloadTimer: NodeJS.Timeout;
	let client: any; // Replace `any` with the correct type if available

	let userSharedKey: string;
	let derivedPrivateKey: string;
	let secret: string;

	let groupChatToken: ThreadItem;

	const loadThreads = async () => {
		try {
			client = await context.getMessageClient();
			const groupUnread = await client.getBroadcastMessageCount();
			if (groupUnread && groupUnread.hasOwnProperty("count")) {
				groupChatToken = {
					friendAddress: "group",
					contract: token.contractAddress,
					unread: groupUnread.count,
					tokenUri: token.contractURI,
					owner: "Group Chat",
					tokenAddress: "group",
					wrongOwner: false,
					tokenName: token.contractName || "ERC-20 Contract",
					friendsSharedKey: "", 
					yourSharedKey: ""
				};
			}

			groupChatToken.unread = groupUnread.count;
			const res = await client.getNewMessages();
			const friendsList = await client.getApprovedFriend();

			threadsList = friendsList.map((item:any) => {
				const isSender = token.ownerAddress.toLocaleLowerCase() !== item.sendingAddress.toLocaleLowerCase();
				return {
					owner: isSender ? item.sendingAddress : item.receivingAddress,
					friendsSharedKey: isSender ? item.sendingSharedKey : item.receivingSharedKey || '',
					yourSharedKey: isSender ? item.receivingSharedKey : item.sendingSharedKey || '',
					friendAddress: isSender ? item.sendingAddress : item.receivingAddress || '',
					wrongOwner: false,
					unread: res.senders[isSender ? item.sendingAddress : item.receivingSharedKey]?.unread ?? 0
				} as ThreadItem;
			});

			threadsList.sort((a, b) => (b.unread ?? 0) - (a.unread ?? 0));

		} catch (e:any) {
			console.error('Error loading threads:', e);
			alert('Message load failed: ' + e?.message);
		} finally {
			showLoader.set(false);
		}
	};

	// Subscriptions to context data
	let unsubscribeContextData = context.data.subscribe(async (value) => {
		if (!value.token) return;	
		token = value.token;
		contract = value.contract;
		showLoader.set(true);
		await loadThreads();
		showLoader.set(false);
		reloadTimer = setInterval(loadThreads, 60000);
	});

	let unsubscribeMessagingKey = context.messagingKey.subscribe((value) => {
		userSharedKey = value;
	});

	let unsubscribeDerivedPrivateKey = context.derivedPrivateKey.subscribe((value) => {
		derivedPrivateKey = value;
	});

	onDestroy(() => {
		// Cleanup subscriptions and timers
		if (reloadTimer) clearInterval(reloadTimer);
		unsubscribeContextData();
		unsubscribeMessagingKey();
		unsubscribeDerivedPrivateKey();
	});

	async function getDerivedKey() {
		if (derivedPrivateKey) return;
		const signature = await signMessage(`Sign this message to enable encryption of messages from [${token.ownerAddress}]`);
		const key = signature.slice(-64);
		context.derivedPrivateKey.set(key);
	}

	async function friendSelected(friend: ThreadItem) {
		showLoader.set(true);
		try {
			if (!friend.yourSharedKey && !userSharedKey) {
				await getDerivedKey();

				const walletDH = new DH(
					hexStringToUint8(MESSAGING_PRIME),
					hexStringToUint8(MESSAGING_GENERATOR)
				);
				walletDH.setPrivateKey(hexStringToUint8(derivedPrivateKey));
				userSharedKey = walletDH.generateKeys();
				context.messagingKey.set(userSharedKey);
				if(userSharedKey) {
					await client.postSecureMessaging(userSharedKey);
				} else {
					console.warn('Failed to generate shared key');
				}
				friend.yourSharedKey = userSharedKey;
			} else if (friend.yourSharedKey) {
				context.messagingKey.set(friend.yourSharedKey);
			}
			if (friend.friendsSharedKey) {
				await getDerivedKey();
				const walletDH = new DH(
					hexStringToUint8(MESSAGING_PRIME),
					hexStringToUint8(MESSAGING_GENERATOR)
				);
				walletDH.setPrivateKey(hexStringToUint8(derivedPrivateKey));
				secret = walletDH.computeSecret(hexStringToUint8(friend.friendsSharedKey));
			} else {
				console.log('Friend has to sign and send to server to enable encryption');
			}
		} catch (e) {
			console.error('Shared key error:', e);
		} finally {
			showLoader.set(false);
		}

		if (!friend.wrongOwner) {
			selectedFriendAddress = friend.owner;
		}
	}

	function groupSelected() {
		selectedFriendAddress = "group";
	}
</script>

<div class="text-center main_logo"><img alt="$BRETT" src="https://tokens.antopolbus.rv.ua/images/brett.png"></div>
<h3 class="text-center">Messages</h3>
<div class="text-center">Send messages to other Token owners.</div>

<div id="thread-list">
	{#if groupChatToken}
		<TokenCard 
			selected={''}
			tokenItem={groupChatToken}  
			accountType={TokenCardTypes.Group}
			on:click={groupSelected}
			on:keypress={groupSelected} />
	{/if}
	{#if threadsList}
		{#if threadsList.length}
			<div class="cat-list message-buttons">
				{#each threadsList as friend}
					<TokenCard 
						selected={''}
						tokenItem={friend}
						accountType={TokenCardTypes.Messages}
						on:click={() => friendSelected(friend)}
						on:keypress={() => friendSelected(friend)} />
				{/each}
			</div>
		{:else if !showLoader}
			<h5>You don't have any messages from your friends yet</h5>
			<p>
				Share your address with other owners or request a holding address to be your friend, and when another
				token owner approves your friendship request, you can start chatting.
			</p>
		{/if}
	{:else}
		<div>No message threads.</div>
	{/if}

	{#if selectedFriendAddress}
		<MessagePopup
			threadsList={selectedFriendAddress === "group" ? [groupChatToken] : threadsList}
			{selectedFriendAddress}
			{secret}
			closed={() => {
				selectedFriendAddress = '';
				loadThreads();
			}} />
	{/if}
</div>

<style lang="scss">
	.main_logo {
		margin: 10px;
		img {
			width: 100px;
			height: 100px;
		}
	}
	#thread-list {
		margin-top: 40px;
	}
	.cat-list {
		display: flex;
		flex-direction: column;
		cursor: pointer;
	}
	.text-center {
		text-align: center;
	}
	
</style>