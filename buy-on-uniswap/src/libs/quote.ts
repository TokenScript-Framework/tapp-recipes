import { computePoolAddress } from '@uniswap/v3-sdk'
import QuoterV2 from '@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import {
	POOL_FACTORY_CONTRACT_ADDRESS,
	QUOTER_CONTRACT_ADDRESS, RPC_PROVIDER,
} from './constants'
import { fromReadableAmount } from './conversion'
import {Ether, Token} from "@uniswap/sdk-core";

export interface UniswapConfig {
	rpc: {
		base: string
	}
	walletAddress?: string,
	tokens: {
		in: Token|Ether,
		amountIn: number
		out: Token|Ether,
		poolFee: number
	}
}

export interface QuoteResult {
	token0: string
	token1: string
	fee: bigint,
	liquidity: bigint,
	sqrtPriceX96: bigint,
	tick: bigint,
	amountOut: bigint,
	sqrtPriceX96After: bigint
}

export async function quote(config: UniswapConfig): Promise<QuoteResult> {
	const quoterContract = new ethers.Contract(
		QUOTER_CONTRACT_ADDRESS,
		QuoterV2.abi,
		RPC_PROVIDER
	)
	const poolConstants = await getPoolConstants(config)

	console.log("Pool constants: ", poolConstants);

	const quoteResult = await quoterContract.getFunction("quoteExactInputSingle").staticCall({
			tokenIn: poolConstants.token0,
			tokenOut: poolConstants.token1,
			fee: poolConstants.fee,
			amountIn: fromReadableAmount(
				config.tokens.amountIn,
			config.tokens.in.decimals
		).toString(),
		sqrtPriceLimitX96: 0
	});

	return {
		token0: poolConstants.token0!,
		token1: poolConstants.token1!,
		fee: poolConstants.fee!,
		liquidity: poolConstants.liquidity!,
		sqrtPriceX96: poolConstants.sqrtPriceX96!,
		tick: poolConstants.tick!,
		amountOut: quoteResult.amountOut,
		sqrtPriceX96After: quoteResult.sqrtPriceX96After
	};
}

async function getPoolConstants(config: UniswapConfig): Promise<Partial<QuoteResult>> {
	const currentPoolAddress = computePoolAddress({
		factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
		tokenA: config.tokens.in.wrapped,
		tokenB: config.tokens.out.wrapped,
		fee: config.tokens.poolFee,
		chainId: parseInt(chainID)
	})

	//const currentPoolAddress = "0xc9034c3E7F58003E6ae0C8438e7c8f4598d5ACAA";

	console.log("Pool address: ", currentPoolAddress);

	const poolContract = new ethers.Contract(
		currentPoolAddress,
		IUniswapV3PoolABI.abi,
		tokenscript.eth.getRpcProvider(parseInt(chainID))
	)

	const [token0, token1, fee, liquidity, slot0] = await Promise.all([
		poolContract.token0(),
		poolContract.token1(),
		poolContract.fee(),
		poolContract.liquidity(),
		poolContract.slot0(),
	]);

	return {
		token0,
		token1,
		fee,
		liquidity,
		sqrtPriceX96: slot0[0],
		tick: slot0[1],
	}
}