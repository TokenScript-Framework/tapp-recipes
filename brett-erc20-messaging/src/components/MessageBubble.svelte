<script lang="ts">
	export let message: {
		createdAt: number;
		senderTokenAddress: string;
		message: string;
		messageDecoded: string;
		read: boolean;
		encrypted: boolean;
	};
	export let senderTokenAddress: string;

	let dateString: string;

	$: {
		const now = new Date();
		const date = new Date(message.createdAt);
		date.setTime(date.getTime() + now.getTimezoneOffset() * 60000);
		if (date.getDate() < now.getDate()) {
			dateString = date.toLocaleString();
		} else {
			dateString = date.toLocaleTimeString();
		}
	}
</script>

<div style="display: flex;align-items: center">
	{#if message.sendingTokenAddress.toLowerCase() !== senderTokenAddress.toLowerCase()}
		<img class="avatar" alt="$BRETT" src="https://tokens.antopolbus.rv.ua/images/brett.png" />
	{/if}
	<div
		class="message-bubble {message.sendingTokenAddress.toLowerCase() ==
		senderTokenAddress.toLowerCase()
			? 'sender'
			: ''} "
		data-message-sender={message.sendingTokenAddress}
		data-sender={senderTokenAddress}
	>
		<div class="message-content">
			{message.messageDecoded ? message.messageDecoded : message.message}
		</div>
		<small class="message-meta">
			{message.senderTokenAddress == senderTokenAddress && (message.read || message.openedAt)
				? '✓ (seen) '
				: ''}
			{dateString}
		</small>
	</div>
	{#if message.sendingTokenAddress.toLowerCase() === senderTokenAddress.toLowerCase()}
		<img class="avatar" alt="$BRETT" src="https://tokens.antopolbus.rv.ua/images/brett.png" />
	{/if}
</div>

<style lang="scss">
	.avatar {
		width: 30px;
		height: 30px;
		margin: 5px;
	}
	.message-bubble {
		margin: 5px;
		border-radius: 10px;
		width: 90%;
		background: #eeeeee;
		// border-radius: 0px 8px 8px 8px;
		border-radius: 8px;
		color: #0f6704;
		border-color: #0f6704;

		.message-content {
			padding: 6px;
			font-size: 14px;
			text-align: left;
			word-break: break-all;
		}

		.message-meta {
			padding: 0 6px 6px;
			font-size: 11px;
			text-align: right;
			display: block;
			color: #545454;
		}

		&.sender {
			align-self: end;
			// border-radius: 8px 0px 8px 8px;
		}
		&.new,
		&.sender {
			// background: linear-gradient(234.79deg, #001aff 37.73%, #4f95ff 118.69%);
			background: #0f6704;
			color: #fff;
			.message-meta {
				color: #cecece;
			}
		}
	}
</style>
