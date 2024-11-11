<script>
	let secretPhrase = ''
	
	function handleMint() {
	  console.log('Minting with secret:', secretPhrase)
	  // Add minting logic here
	}
  </script>
  
  <div class="min-h-screen bg-blue-600 flex flex-col items-center justify-center p-4">
	<div class="w-full max-w-md flex flex-col items-center gap-4">
	  <!-- Pixel Art Frame -->
	  <div class="w-32 h-32 md:w-40 md:h-40 rounded-full bg-blue-700 flex items-center justify-center p-1 relative">
		<!-- Arcade Cabinet Pixel Art -->
		<div class="w-24 h-24 md:w-32 md:h-32 relative">
		  <div class="absolute inset-0">
			<!-- Cabinet Frame -->
			<div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-green-400"></div>
			<div class="absolute top-2 left-1/2 -translate-x-1/2 w-3/4 h-3/4 border-4 border-green-400">
			  <!-- Screen -->
			  <div class="absolute inset-1 border-4 border-pink-500 bg-gray-900 flex items-center justify-center">
				<div class="w-3 h-3 bg-white rounded-full animate-pulse"></div>
			  </div>
			</div>
			<!-- Cabinet Base -->
			<div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-1/4 bg-teal-300"></div>
		  </div>
		</div>
		
		<!-- Sparkles -->
		<div class="absolute top-2 right-2 text-orange-300 text-xl">✦</div>
		<div class="absolute bottom-4 left-2 text-orange-300 text-sm">✦</div>
		<div class="absolute top-1/2 right-0 text-orange-300 text-sm">✦</div>
	  </div>
  
	  <h1 class="text-white text-2xl font-bold text-center mb-4">
		Mint a Sovenier NFT
	  </h1>
  
	  <input
		type="password"
		bind:value={secretPhrase}
		placeholder="Enter secret phrase"
		class="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
	  />
  
	  <button
		on:click={handleMint}
		class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
	  >
		MINT
	  </button>
  
	  <a 
		href="/create" 
		class="text-white/80 hover:text-white text-sm transition-colors"
	  >
		Make My Own
	  </a>
	</div>
  </div>