<script lang="ts">
	import ClickToCopy from '../components/ClickToCopy.svelte';
	import context from '../lib/context';

	let token;
	context.data.subscribe((value) => {
		token = value.token;
	});

	let eventName = '';
	let description = '';
	let imageUrl = '';
	let imageUrlValid = '';
	let selectedFile = null;
	let fileInput = null;
	let startDate = '';
	let startDateValid = '';
	let endDate = '';
	let endDateValid = '';
	let attendees = '';
	let attendeesValid = '';
	let mintCondition = 'public';
	let secret = '';
	let tlink = '';
	let totalBalance = 0;
	let missingRequirement = '';


	const uriPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

	function handleFileSelect(event) {
		const file = event.target.files[0];
		if (file) {
			selectedFile = file;
		}
	}

	async function handleSubmit() {
		if (missingRequirement) {
			console.log('Fill the full form');
			return;
		}
		// Handle form submission
		tlink = await getTlink(
			{
				name: eventName,
				description,
				imageUrl,
				startDate,
				endDate,
				attendees,
				mintCondition,
				secret
			},
			selectedFile
		);
	}

	$: {
		totalBalance = getSLNTotalBalance()

		missingRequirement = ''
		if (!eventName) {
			missingRequirement = 'Event name required. ';
		} 

		if (imageUrl && !imageUrlValid) {
			missingRequirement += 'Image URL format invalid. ';
		}

		if (!imageUrlValid && !selectedFile) {
			missingRequirement += 'Souvenir image required. ';
		}

		if (!startDate) {
			missingRequirement += 'Start date required. ';
		}

		if (!endDate) {
			missingRequirement += 'End date required. ';
		}

		if (startDate && endDate && startDate > endDate) {
			missingRequirement += 'Start date must be before end date. ';
		}

		if (endDate && !endDateValid) {
			missingRequirement += 'End date must be in the future. ';
		}
		
		if (!attendeesValid) {
			missingRequirement += 'Number of attendees must be greater than 0. ';
		}

		if (mintCondition == 'private' && !secret) {
			missingRequirement += 'Private minting require secret word. ';
		}

		if (attendees >= 25  && totalBalance < 100n * 10n**18n) {
			missingRequirement += 'You need to hold at least 100 SLN to create souvenir with 25+ attendees. ';
		}
	}
	$: {
		startDateValid = !endDate || startDate <= endDate
		endDateValid = endDate >= new Date().toISOString().split("T")[0]
		attendeesValid = attendees > 0
		imageUrlValid = !imageUrl || uriPattern.test(imageUrl)
		
	}
	function getSLNTotalBalance() {
		if (!env.SLN_CHAIN_LIST) {
			return 0;
		}
		const chainList = env.SLN_CHAIN_LIST.split(',');
		const totalBalance = chainList.reduce((acc, chain) => {
			const slnBalance = token[`SLN_${chain.toUpperCase()}_Balance`];
			if (slnBalance) {
				return acc + BigInt(slnBalance);
			}
			return acc;
		}, 0n);
		return totalBalance;
	}
	export async function getTlink() {
		const msgToSign = JSON.stringify({
			name: eventName || "",
			description: description || "",
			startDate: startDate || "",
			endDate: endDate || "",
			attendees: (attendees || 0).toString(),
			mintCondition: mintCondition
		});

		const signature = (await tokenscript.personal.sign({ data: msgToSign })) as string;

		// TODO fix coinBase smartwalletSignature
		console.log({ msgToSign, signature });

		tokenscript.action.showLoader();

		const formData = new FormData();
		eventName && formData.append('name', eventName);
		description && formData.append('description', description);
		imageUrl && formData.append('imageUrl', imageUrl);
		startDate && formData.append('startDate', startDate);
		endDate && formData.append('endDate', endDate);
		attendees && formData.append('attendees', attendees.toString());
		mintCondition && formData.append('mintCondition', mintCondition);
		secret && formData.append('secret', secret);
		formData.append('signature', signature);
		fileInput && fileInput.files?.length && formData.append('file', fileInput.files[0]);

		const res = await fetch(tokenscript.env.API_BASE_URL + `/create`, {
			method: 'POST',
			body: formData
		});

		const data = await res.json();

		if (!res.ok) {
			// missingRequirement = `Failed to create souvenir.` + data?.error ? `Error: ${data.error}` : '';
			tokenscript.action.showMessageToast('error', 'Failed to create souvenir', data?.error || '');
		} else {

		}
		tokenscript.action.hideLoader();
		return data['tlinkUrl'] || '';
	}

</script>

<div class="inset-0 bg-black/50-off flex items-center justify-center">
	<div class="bg-white rounded-lg w-full max-w-2xl p-6 relative">
		<h1 class="text-2xl font-bold mb-6">Souvenir NFT</h1>

		<div class="flex justify-center mb-6">
			<img
				src="https://tokens.antopolbus.rv.ua/images/poap_logo.png"
				alt="NFT Logo"
				class="w-32 h-32 rounded-full"
			/>
		</div>

		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<div>
				<label class="flex items-center gap-2 text-lg font-medium mb-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 text-orange-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						/>
					</svg>
					Event Name
				</label>
				<input
					type="text"
					bind:value={eventName}
					class="w-full p-3 border rounded-lg"
					placeholder="Enter event name"
					required
				/>
			</div>

			<div>
				<label class="flex items-center gap-2 text-lg font-medium mb-2 mt-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 text-orange-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h7"
						/>
					</svg>
					Description
				</label>
				<input
					type="text"
					bind:value={description}
					class="w-full p-3 border rounded-lg"
					placeholder="Enter description"
					required
				/>
			</div>

			<div>
				<label class="flex items-center gap-2 text-lg font-medium mb-2 mt-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 text-orange-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
					Souvenir Image
				</label>
				<input
					type="text"
					bind:value={imageUrl}
					class="w-full p-3 border rounded-lg mb-2 {imageUrlValid ? "" : "text-red-700"}"
					placeholder="Enter image URL"
				/>
				<div class="flex gap-4 items-center">
					<label class="flex items-center gap-2 text-orange-400 cursor-pointer" for="file-upload">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
							/>
						</svg>
						Upload
					</label>
					<input
						type="file"
						on:change={handleFileSelect}
						bind:this={fileInput}
						class="hidden"
						id="file-upload"
						accept="image/*"
					/>
					<span class="text-gray-500">{selectedFile?.name || 'No file chosen'}</span>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div>
					<label class="block text-purple-600 mb-2 mt-4">Event start date *</label>
					<input type="date" bind:value={startDate} class="w-full p-3 border rounded-lg {startDateValid ? "" : "text-red-700"}" required/>
				</div>
				<div>
					<label class="block text-purple-600 mb-2 mt-4">Event end date *</label>
					<input type="date" bind:value={endDate} min={new Date().toISOString().split('T')[0]} class="w-full p-3 border rounded-lg {!endDate || endDateValid ? "" : "text-red-700"}" required/>
				</div>
				<div>
					<label class="block text-purple-600 mb-2 mt-4">Amount of attendees</label>
					<input
						type="number"
						bind:value={attendees}
						class="w-full p-3 border rounded-lg {attendeesValid ? "" : "text-red-700"}"
						placeholder="000" required
						min="1"
					/>
				</div>
			</div>

			<div>
				<h3 class="text-xl font-bold mb-4 mt-2 mt-4">Mint Condition</h3>
				<div class="flex gap-8 items-center">
					<label class="flex items-center gap-2">
						<input type="radio" bind:group={mintCondition} value="public" class="w-4 h-4" />
						Public
					</label>
					<label class="flex items-center gap-2">
						<input type="radio" bind:group={mintCondition} value="private" class="w-4 h-4" />
						Private
					</label>
					{#if mintCondition === 'private'}
						<input
							type="text"
							bind:value={secret}
							class="p-3 border rounded-lg bg-gray-100 ml-auto"
							placeholder="secret"
						/>
					{/if}
				</div>
			</div>

			{#if missingRequirement}
				<div class="pt-4 text-red-500 text-center">{missingRequirement}</div>
			{/if}

			<button
				type="submit"
				class="w-full py-4 mt-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors {!missingRequirement
					? 'active'
					: 'inactive'}"
				disabled={missingRequirement}
			>
				Create Souvenir NFT
			</button>
		</form>

		{#if tlink}
			<div class="pt-4">Share this Tlink to your attendies and they can mint Souvenir NFT</div>
			<ClickToCopy value={tlink} />
		{/if}
	</div>
</div>

<style land="scss">
	.inactive {
		pointer-events: none;
		opacity: 0.5;
	}
</style>
