<div class="treasure-border">
	<!-- <div class="text-center title">Treasure Boxes Game</div> -->
	<img class="img" src="https://tokens.antopolbus.rv.ua/images/rewarded_box5.png" alt="" />
	<div style="text-align: center">
		Treasure Box TAPP works only with TLink Chrome extension.
		<br />You can install it from this URL
		<br />
		<a class="btn-gradient"
			target="_blank"
			href="https://chromewebstore.google.com/detail/tlink/eblnpllcmmepkmpaalggpibindkplcjj?hl=en"
			>Install Tlink browser extension</a
		>
		<br />Once you install the extension you can share the link
		<br /><a class="btn-gradient"
			href="https://viewer.tokenscript.org/?chain=11155111&contract=0xa7C3CbBBF5b1986fBa241381f04115B699D6d271#card=OpenTreasureBox"
			>Link to the Treasure Box game</a
		>
		<br />on your page or just open current tweet again and it will be available to you to get a
		chance to win up to $50 in tokens!
    </div>
</div>

<style lang="scss">
    .text-center {
		text-align: center;
	}
    .img {
        width: 100%;
        margin-top: 10px;
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
