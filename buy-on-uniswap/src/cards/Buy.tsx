import React, {useEffect, useState} from "react";
import {ITokenContextData} from "@tokenscript/card-sdk/dist/types";
import {Ether, Token} from '@uniswap/sdk-core';
import {ADDRESS_ZERO, FeeAmount} from '@uniswap/v3-sdk';
import {quote, QuoteResult, UniswapConfig} from "../libs/quote.ts";
import {fromReadableAmount} from "../libs/conversion.ts";
import {RPC_PROVIDER, SWAP_TOKEN_LIST, TokenDetails} from "../libs/constants.ts";
import {getERC20Contract, swap} from "../libs/swap.ts";
import Loader from "../components/loader/loader.tsx";

interface BuyProps {
	token?: ITokenContextData;
	referralCode: string | null;
}

export const Buy: React.FC<BuyProps> = ({ token }) => {

	const chainId = parseInt(chainID);
	const [outToken, setOutToken] = useState<Token|null>(null);
	const [inToken, setInToken] = useState<Token|Ether|null>(null);
	const [amountIn, setAmountIn] = useState<number>(0.0001);
	const [currentQuote, setCurrentQuote] = useState<QuoteResult|null>(null);
	const [currentBalance, setCurrentBalance] = useState<bigint|null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [poolFee, setPoolFee] = useState<FeeAmount>(FeeAmount.MEDIUM);
	const [inTokenUSDPrice, setInTokenUSDPrice] = useState<number|null>(null);
	const [outTokenUSDPrice, setOutTokenUSDPrice] = useState<number|null>(null);

	useEffect(() => {

		if (!token || outToken)
			return;

		setOutToken(new Token(
			token.chainId,
			token.contractAddress as string,
			token.decimals ?? 18,
			token.name,
			token.symbol
		));

		/**
		 * 18,
		 * 'Degen',
		 * 'DEGEN'
		 */

		setInCurrency(SWAP_TOKEN_LIST[0]);

	}, [token]);

	useEffect(() => {
		if (inToken && outToken){
			fetchUSDPrice(inToken, setInTokenUSDPrice);
			fetchUSDPrice(outToken, setOutTokenUSDPrice)
		}
	}, [inToken, outToken]);

	async function fetchUSDPrice(token: Token | Ether, callback){

		try {
			const res = await fetch(`https://api.token-discovery.tokenscript.org/get-token-price?chain=${token.chainId}&smartContract=${token.isNative ? ADDRESS_ZERO : token.wrapped.address}`);
			const data = await res.json();

			console.log("USD price: ", data);

			callback(data.usdPrice);
		} catch (e) {
			console.error("Failed to fetch currency rates: ", e);
		}
	}

	useEffect(() => {

		setIsLoading(true);

		if (inToken){

			if (inToken.isNative){
				RPC_PROVIDER.getBalance(walletAddress).then((balance) => {
					setCurrentBalance(balance);
				});
			} else {
				const contract = getERC20Contract(inToken.wrapped.address);
				contract.getFunction("balanceOf").staticCall(walletAddress).then((balance) => {
					setCurrentBalance(balance);
				})
			}
		}

		if (outToken && amountIn > 0){

			const uniswapConfig: UniswapConfig = {
				rpc: {
					base: tokenscript.eth.getRpcUrls(chainId)[0]
				},
				tokens: {
					in: inToken.wrapped,
					amountIn,
					out: outToken.wrapped,
					poolFee,
				}
			}

			quote(uniswapConfig).then((newQuote) => {
				setCurrentQuote(newQuote);
				console.log("New quote: ", newQuote);
				setIsLoading(false);
			}).catch((e: any) => {
				tokenscript.action.showMessageToast("error", "Failed to load quote", e.message);
				setIsLoading(false);
			});

		} else {
			setIsLoading(false);
		}

	}, [inToken, amountIn]);

	function setInCurrency(tokenDetails: TokenDetails){
		setCurrentQuote(null);
		setCurrentBalance(null);
		setPoolFee(tokenDetails.feeTier ?? FeeAmount.MEDIUM);
		setInToken(
			tokenDetails.address === ADDRESS_ZERO ?
				new Ether(chainId) :
				new Token(
					tokenDetails.chainId,
					tokenDetails.address,
					tokenDetails.decimals,
					tokenDetails.symbol,
					tokenDetails.name
				)
		);
	}

	async function swapToken(){

		const config: UniswapConfig = {
			rpc: {
				base: tokenscript.eth.getRpcUrls(chainId)[0]
			},
			tokens: {
				in: inToken!,
				amountIn,
				out: outToken!,
				poolFee,
			}
		}

		await swap(config, currentQuote!.amountOut);
	}

	function getButtonText(){

		if (isLoading)
			return "Loading quote";

		if (!currentQuote)
			return "Failed to load quote";

		if (!amountIn)
			return "Please enter a valid amount";

		if (currentBalance != null && currentBalance < fromReadableAmount(amountIn, inToken!.decimals))
			return "Insufficient balance";

		return "Swap"
	}

	function formatAmount(wei, decimals){
		return parseFloat(Number(ethers.formatUnits(wei, decimals)).toFixed(4));
	}

	function sqrtToPrice(sqrt: bigint, decimals0: number, decimals1: number, token0IsInput = true){
		let ratio = (sqrt ** 2n) / 2n ** 192n;
		const shiftDecimals = 10n ** BigInt(decimals0 - decimals1);
		ratio = ratio * shiftDecimals;
		if (!token0IsInput){
			ratio = 1n / ratio;
		}
		return Number(ratio);
	}

	function calcPriceImpact(currentQuote: QuoteResult){
		const price = sqrtToPrice(currentQuote.sqrtPriceX96, inToken?.decimals!, outToken?.decimals!, currentQuote.token0 === inToken?.wrapped.address);
		const priceAfter = sqrtToPrice(currentQuote.sqrtPriceX96After, inToken?.decimals!, outToken?.decimals!, currentQuote.token0 === inToken?.wrapped.address);

		console.log("price", price);
		console.log("priceAfter", priceAfter);

		const impact = (priceAfter - price) / price;

		console.log("IMPACT: ", impact);

		return (impact * 1000).toFixed(2);
	}

	return token && (
		<div className="swap-container">
			<div className="swap-panel">
				<img
					style={{width: '200px', borderRadius: '50%'}}
					src={token.image_preview_url}
					alt="Token Logo"
				/>
				<h3 style={{margin: '0 0 10px 0'}}>
					Buy {token.name} on Uniswap
				</h3>

				{/*<div className="field">
					<label>Purchase Currency</label>
					<select>
						{SWAP_TOKEN_LIST.map((token) => {
							return (
								<option onClick={() => setInCurrency(token)}
								        selected={!!(inToken && token.address === (inToken?.isNative ? ADDRESS_ZERO : inToken.wrapped.address))}>
									{token.name}
								</option>
							)
						})}
					</select>
				</div>*/}

				<div className="swap-box">
					<label>Purchase</label>
					<input className="amount-input" type="number" value={amountIn} onChange={(e) => {
						const newAmount = parseFloat(e.target.value) ?? 0;
						setAmountIn(newAmount);
					}}/>
					<span>{inTokenUSDPrice ? ` ($${(amountIn * inTokenUSDPrice).toFixed(2)} USD)` : ''}</span>
					{
						currentBalance !== null && (
							<div className="field" style={{marginTop: '15px'}}>
								<strong style={{fontSize: '12px'}}>Balance: </strong>
								<span style={{fontSize: '12px'}}>
									{formatAmount(currentBalance, inToken?.decimals)} {inToken?.name}
									{inTokenUSDPrice ? ` ($${(formatAmount(currentBalance, inToken?.decimals) * inTokenUSDPrice).toFixed(2)} USD)` : ''}
								</span>
							</div>
						)
					}
				</div>

				<div className="swap-box" style={{margin: "10px 0"}}>
					{!isLoading && currentQuote && (
						<>
							<label>You get:</label>
							<input className="amount-input"
							       value={formatAmount(currentQuote.amountOut, outToken.decimals)}/>
							<div>
								<span>{token.symbol}</span>
								<span>{outTokenUSDPrice ? ` ($${(formatAmount(currentQuote.amountOut, outToken.decimals) * outTokenUSDPrice).toFixed(2)} USD)` : ''}</span>
							</div>
						</>
					)}
					<Loader show={isLoading}/>
				</div>

				{
					currentQuote && (
						<div>
							<small className="label">Price Impact: </small>
							<small className="value">{calcPriceImpact(currentQuote)}%</small>
						</div>
					)
				}

			</div>
			<div style={{display: 'flex', flexDirection: 'column', width: "100%"}}>
				<button style={{width: "100%"}} onClick={() => swapToken()} disabled={isLoading || getButtonText() !== "Swap"}>
					{getButtonText()}
				</button>
			</div>
		</div>
	);
};
