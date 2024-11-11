<script>
	let eventName = ''
	let description = ''
	let imageUrl = ''
	let selectedFile = null
	let startDate = ''
	let endDate = ''
	let attendees = ''
	let mintCondition = 'public'
	let secret = ''
  
	function handleFileSelect(event) {
	  const file = event.target.files[0]
	  if (file) {
		selectedFile = file
	  }
	}
  
	function handleSubmit() {
	  // Handle form submission
	  console.log({
		eventName,
		description,
		imageUrl,
		selectedFile,
		startDate,
		endDate,
		attendees,
		mintCondition,
		secret
	  })
	}
  </script>
  
  <div class="inset-0 bg-black/50-off flex items-center justify-center">
	<div class="bg-white rounded-lg w-full max-w-2xl p-6 relative">
  
	  <h1 class="text-2xl font-bold mb-6">Sovenier NFT</h1>
  
	  <div class="flex justify-center mb-6">
		<img src="https://tokens.antopolbus.rv.ua/images/poap_logo.png" alt="NFT Logo" class="w-32 h-32 rounded-full" />
	  </div>
  
	  <form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<div>
		  <label class="flex items-center gap-2 text-lg font-medium mb-2">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
			</svg>
			Event Name
		  </label>
		  <input
			type="text"
			bind:value={eventName}
			class="w-full p-3 border rounded-lg"
			placeholder="Enter event name"
		  />
		</div>
  
		<div>
		  <label class="flex items-center gap-2 text-lg font-medium mb-2">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
			</svg>
			Description
		  </label>
		  <input
			type="text"
			bind:value={description}
			class="w-full p-3 border rounded-lg"
			placeholder="Enter description"
		  />
		</div>
  
		<div>
		  <label class="flex items-center gap-2 text-lg font-medium mb-2">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
			</svg>
			Sovenier Image
		  </label>
		  <input
			type="text"
			bind:value={imageUrl}
			class="w-full p-3 border rounded-lg mb-2"
			placeholder="Enter image URL"
		  />
		  <div class="flex gap-4 items-center">
			<label class="flex items-center gap-2 text-orange-400 cursor-pointer">
			  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
			  </svg>
			  Upload
			</label>
			<input
			  type="file"
			  on:change={handleFileSelect}
			  class="hidden"
			  id="file-upload"
			  accept="image/*"
			/>
			<span class="text-gray-500">{selectedFile?.name || 'No file chosen'}</span>
			<button class="px-4 py-2 bg-orange-200 text-orange-700 rounded-lg">Upload</button>
		  </div>
		</div>
  
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		  <div>
			<label class="block text-purple-600 mb-2">Event start date *</label>
			<input
			  type="date"
			  bind:value={startDate}
			  class="w-full p-3 border rounded-lg"
			  required
			/>
		  </div>
		  <div>
			<label class="block text-purple-600 mb-2">Event end date *</label>
			<input
			  type="date"
			  bind:value={endDate}
			  class="w-full p-3 border rounded-lg"
			  required
			/>
		  </div>
		  <div>
			<label class="block text-purple-600 mb-2">Amount of attendees</label>
			<input
			  type="number"
			  bind:value={attendees}
			  class="w-full p-3 border rounded-lg"
			  placeholder="000"
			/>
		  </div>
		</div>
  
		<div>
		  <h3 class="text-xl font-bold mb-4 mt-2">Mint Condition</h3>
		  <div class="flex gap-8 items-center">
			<label class="flex items-center gap-2">
			  <input
				type="radio"
				bind:group={mintCondition}
				value="public"
				class="w-4 h-4"
			  />
			  Public
			</label>
			<label class="flex items-center gap-2">
			  <input
				type="radio"
				bind:group={mintCondition}
				value="private"
				class="w-4 h-4"
			  />
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
  
		<button
		  type="submit"
		  class="w-full py-4 mt-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors"
		>
		  Create Souvenir NFT
		</button>
	  </form>
	</div>
  </div>