export const getConfig = () => {
	const params = new URLSearchParams(document.location.hash.substring(1));

	return {
		walletAddress: params.get('walletAddress') ?? '',
		description: params.get('description') ?? '',
		avatar: params.get('avatar') ?? '',
		contractLogo: params.get('contractLogo') ?? ''
	};
};
